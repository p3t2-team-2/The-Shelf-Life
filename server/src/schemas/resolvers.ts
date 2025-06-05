import fetch from "node-fetch";
// import { time } from 'node:console';
import { Profile } from "../models/index.js";
import { IRecipe, Recipe } from "../models/Recipe.js";
import { SpoonIngredient } from "../models/index.js";
// import { ISpoonIngredient } from '../models/SpoonIngredient.js';
import { signToken, AuthenticationError } from "../utils/auth.js";
import {
  searchRecipes,
  searchRecipesByKeyword,
} from "../utils/spoonacularQueries.js";
// import { getIngredientInfoByName } from "../utils/spoonacularMutations.js";
import { GraphQLJSON } from "graphql-type-json";
import { transformRecipe } from "../utils/spoonacularMutations.js";

interface Profile {
  _id: string;
  name: string;
  email: string;
  password: string;
  calendarMeals?: Record<string, string[]>;
}

interface ProfileArgs {
  profileId: string;
}

interface AddProfileArgs {
  input: {
    name: string;
    email: string;
    password: string;
  };
}

interface ISpoonIngredient {
  id: number;
  item: string;
  unit: string[];
}

interface SpoonacularRecipe {
  id: number;
  name: string;
  image: string;
}

interface Context {
  user?: Profile;
}

const resolvers = {
  JSON: GraphQLJSON,

  
  Query: {
    profiles: async (): Promise<Profile[]> => {
      return await Profile.find();
    },
    profile: async (
      _parent: any,
      { profileId }: ProfileArgs
    ): Promise<Profile | null> => {
      return await Profile.findOne({ _id: profileId });
    },
    me: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        return await Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("invalid token");
    },
    ingredients: async (
      _parent: any,
      { keyword }: { keyword: string }
    ): Promise<any[]> => {
      return await SpoonIngredient.find({
        item: { $regex: keyword, $options: "i" },
      });
    },
    spoonacularRecipes: async (_parent: any): Promise<SpoonacularRecipe[]> => {
      const recipes: any = await searchRecipes();
      console.log("recipes:", recipes);

      return recipes;
    },
    recipeById: async (
      _parent: any,
      { id }: { id: number }
    ): Promise<IRecipe | null> => {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(
          `Error fetching recipe with ID ${id}: ${response.statusText}`
        );
      }
      const recipeData = await response.json();
      const recipe: IRecipe = {
        id: recipeData.id,
        name: recipeData.title,
        description: recipeData.summary,
        image: recipeData.image,
        ingredients: recipeData.extendedIngredients.map((ingredient: any) => ({
          id: ingredient.id,
          item: ingredient.name,
          quantity: ingredient.amount,
          unit: Array.isArray(ingredient.unit)
            ? ingredient.unit
            : ingredient.unit,
        })),
        instructions:
          recipeData.analyzedInstructions[0]?.steps.map((step: any) => ({
            number: step.number,
            step: step.step,
            time: step.length ? step.length.number : null, // Assuming length is optional
          })) || [],
      };
      return recipe;
    },
    ingredientById: async (
      _parent: any,
      { id }: { id: number }
    ): Promise<ISpoonIngredient | null> => {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching ingredient with ID ${id}: ${response.statusText}`
        );
      }

      const ingredientData = await response.json();

      const ingredient: ISpoonIngredient = {
        id: ingredientData.id,
        item: ingredientData.name,
        unit: Array.isArray(ingredientData.possibleUnits)
          ? ingredientData.possibleUnits
          : [], // ✅ always an array
      };

      return ingredient;
    },
    searchRecipes: async (
      _parent: any,
      { keywords }: { keywords: string }
    ): Promise<SpoonacularRecipe[]> => {
      return await searchRecipesByKeyword(keywords);
    },
    recommendedRecipes: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<SpoonacularRecipe[]> => {
      if (context.user) {
        const query: string[] = [];
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        userProfile?.pantry.forEach((item: any) => {
          if (item.item) {
            query.push(item.item);
          }
        });
        return (await searchRecipesByKeyword(query)) as Promise<
          SpoonacularRecipe[]
        >;
      }
      throw new AuthenticationError(
        "You need to be logged in to get recommended recipes"
      );
    },
    filteredRecipes: async (
      _parent: any,
      {
        diet,
        intolerances,
        maxReadyTime,
        equipment,
        cuisine,
        number,
      }: {
        diet: string;
        intolerances: string[];
        maxReadyTime: string;
        equipment: string[];
        cuisine: string[];
        number: string;
      }
    ): Promise<SpoonacularRecipe[]> => {
      let query: string = "";
      if (!diet) {
        query += ``;
      } else {
        query += `diet=${diet}`;
      }
      if (intolerances && intolerances.length > 0) {
        query += `&intolerances=${intolerances.join(",")}`;
      }
      if (maxReadyTime) {
        query += `&maxReadyTime=${maxReadyTime}`;
      }
      if (equipment && equipment.length > 0) {
        query += `&equipment=${equipment.join(",")}`;
      }
      if (cuisine && cuisine.length > 0) {
        query += `&cuisine=${cuisine.join(",")}`;
      }
      if (number) {
        query += `&number=${number}`;
      }
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${query}&apiKey=${process.env.SPOONACULAR_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(
          `Error fetching filtered recipes: ${response.statusText}`
        );
      }
      const data = await response.json();
      const recipes: SpoonacularRecipe[] = data.results.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
      }));
      return recipes;
    },
  },

  Mutation: {
    addProfile: async (
      _parent: any,
      { input }: AddProfileArgs
    ): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    addRecipe: async (
      _parent: any,
      { id }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (!context.user) throw new AuthenticationError("Invalid token");

      // Fetch the user's profile
      const userProfile = await Profile.findOne({ _id: context.user._id });

      // Ensure recipes exist before checking for duplicates
      const isAlreadyFavorite = Array.isArray(userProfile?.recipes)
        ? userProfile.recipes.some((recipe) => recipe.id === id)
        : false;

      if (isAlreadyFavorite) {
        throw new Error("Recipe already exists in favorites");
      }

      // Fetch recipe details
      const spoonRecipeRes = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );
      if (!spoonRecipeRes.ok) {
        throw new Error(
          `Failed to fetch recipe. Status: ${spoonRecipeRes.status}`
        );
      }
      const spoonRecipe = await spoonRecipeRes.json();

      // Format recipe
      const recipe = {
        id: spoonRecipe.id,
        name: spoonRecipe.title,
        description: spoonRecipe.summary,
        image: spoonRecipe.image,
        ingredients: spoonRecipe.extendedIngredients.map((ingredient: any) => ({
          id: ingredient.id,
          item: ingredient.name,
          quantity: ingredient.amount,
          unit: Array.isArray(ingredient.unit)
            ? ingredient.unit.join(", ")
            : String(ingredient.unit),
        })),
        instructions: spoonRecipe.analyzedInstructions[0]?.steps?.map(
          (step: any) => ({
            number: step.number,
            step: step.step,
            time: step.length ? String(step.length.number) : "",
          })
        ),
      };

      // Add the recipe only if it doesn't exist
      return await Profile.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { recipes: recipe } },
        { new: true }
      );
    },

    removeRecipe: async (
      _parent: any,
      { id }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const profile = await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { recipes: { id: id } } },
          { new: true }
        );
        return profile;
      }
      throw new AuthenticationError(
        "You need to be logged in to remove favorite recipes"
      );
    },

    addtoPantry: async (
      _parent: any,
      { id, storage, unit, quantity }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        const existingItem = userProfile?.pantry.find(
          (item: any) => item.id === id
        );

        if (existingItem) {
          const updatedProfile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": quantity } },
            { new: true }
          );
          return updatedProfile;
        }
        try {
          const spoonIngredientRes = await fetch(
            `https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
          );
          const spoonIngredient = await spoonIngredientRes.json();
          console.log(spoonIngredient);
          const ingredient = {
            id: spoonIngredient.id,
            item: spoonIngredient.name,
            quantity: quantity,
            unit: unit,
            storage: storage,
            // console.log(ingredient);
          };
          if (!SpoonIngredient.findOne({ id: ingredient.id })) {
            SpoonIngredient.create({
              id: ingredient.id,
              item: ingredient.id,
            });
          }
          const newItem = await Profile.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { pantry: ingredient } },
            { new: true }
          );
          return newItem;
        } catch (error) {
          throw new AuthenticationError(
            "Cant fetch ingredient from Spoonacular API"
          );
          return null;
        }
      }
      throw new AuthenticationError("Unauthenticated");
    },

    increasePantryItem: async (
      _parent: any,
      { id, quantity, unit }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        const pantryItem = userProfile?.pantry.find(
          (item: any) => item.id === id
        );
        const storedUnit = pantryItem?.unit;
        if (!userProfile?.pantry.some((item: any) => item.id === id)) {
          throw new Error("Item does not exists in pantry");
        }
        if (storedUnit === unit) {
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": quantity } },
            { new: true }
          );
          return profile;
        } else {
          console.log("hi");
          const conversionRes = (await fetch(
            `https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=${process.env.SPOONACULAR_API_KEY}`
          )) as any;
          console.log("conversionRes:", conversionRes);
          const conversionData = await conversionRes.json();
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": conversionData.targetAmount } },
            { new: true }
          );
          return profile;
        }
      }
      throw new AuthenticationError(
        "You need to be logged in to increase pantry items"
      );
    },

    cook: async (
      _parent: any,
      { id }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        const spoonRecipeRes = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
        );
        const spoonRecipe = await spoonRecipeRes.json();
        for (const ingredient of spoonRecipe?.extendedIngredients ?? []) {
          const pantryItem = userProfile.pantry.find(
            (item: any) => item.id === ingredient.id
          );
          if (pantryItem) {
            if (pantryItem.unit !== ingredient.unit) {
              // Convert the ingredient amount to the pantry item's unit
              const conversionRes = await fetch(
                `https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${ingredient.unit}&sourceAmount=${ingredient.amount}&targetUnit=${pantryItem.unit}&apiKey=${process.env.SPOONACULAR_API_KEY}`
              );
              const conversionData = await conversionRes.json();
              ingredient.amount = conversionData.targetAmount;
            }
            if (pantryItem.quantity >= ingredient.amount) {
              await Profile.findOneAndUpdate(
                { _id: context.user._id, "pantry.id": ingredient.id },
                { $inc: { "pantry.$.quantity": -ingredient.amount } },
                { new: true }
              );
            } else {
              throw new Error(
                `Insufficient quantity of ${ingredient.name} in pantry`
              );
            }
          }
        }
        // Return the updated profile
        return await Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("invalid token 1");
    },

    addtoPantryByName: async (
      _parent: any,
      { name, storage, unit, quantity }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;

        // Search Spoonacular for ingredient by name
        const searchRes = await fetch(
          `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
            name
          )}&number=1&apiKey=${process.env.SPOONACULAR_API_KEY}`
        );
        const searchData = await searchRes.json();
        const found = searchData.results?.[0];

        if (!found) {
          throw new Error("Ingredient not found");
        }

        const ingredientId = found.id;

        const existingItem = userProfile?.pantry.find(
          (item: any) => item.id === ingredientId
        );
        if (existingItem) {
          const updatedProfile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": ingredientId },
            { $inc: { "pantry.$.quantity": quantity } },
            { new: true }
          );
          return updatedProfile;
        }

        const infoRes = await fetch(
          `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
        );
        const info = await infoRes.json();

        const ingredient = {
          id: ingredientId,
          item: info.name,
          unit: unit,
          quantity,
          storage,
        };

        return await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { pantry: ingredient } },
          { new: true }
        );
      }
      throw new AuthenticationError("invalid token");
    },

    decreasePantryItem: async (
      _parent: any,
      { id, quantity, unit }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        const pantryItem = userProfile?.pantry.find(
          (item: any) => item.id === id
        );
        const storedUnit = pantryItem?.unit;
        if (!userProfile?.antry.some((item: any) => item.id === id)) {
          throw new Error("Item does not exists in pantry");
        }
        if (pantryItem?.quantity < quantity) {
          throw new Error("Insufficient quantity in pantry");
        }
        if (storedUnit === unit) {
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": -quantity } },
            { new: true }
          );
          return profile;
        } else {
          const conversionRes = (await fetch(
            `https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=${process.env.SPOONACULAR_API_KEY}`
          )) as any;
          console.log("conversionRes:", conversionRes);
          const conversionData = await conversionRes.json();
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": -conversionData.targetAmount } },
            { new: true }
          );
          return profile;
        }
      }
      throw new AuthenticationError(
        "You need to be logged in to decrease pantry items"
      );
    },

    removeFromPantry: async (
      _parent: any,
      { id }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const profile = await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { pantry: { id: id } } },
          { new: true }
        );
        return profile;
      }
      throw new AuthenticationError(
        "You need to be logged in to remove items from your pantry"
      );
    },

    addtoShoppingList: async ( _parent: any, { id }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = await Profile.findOne({_id: context.user._id,}) as any;
        const rescipeRes = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`);
        const recipe = await rescipeRes.json();
        recipe.extendedIngredients.forEach((ingredient: any) => {
          if (userProfile?.shoppingList.some((item: any) => item.id === ingredient.id)){
            let userIngredient = userProfile.shoppingList.find((item: any) => item.id === ingredient.id);
            if (ingredient.unit !== userIngredient.unit) {
              let conversionRes = fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${ingredient.unit}&sourceAmount=${ingredient.amount}&targetUnit=${userIngredient.unit}&apiKey=${process.env.SPOONACULAR_API_KEY}`);
              conversionRes.then((res: any) => res.json()).then((data: any) => {
                ingredient.amount = data.targetAmount;
              });
            }
            Profile.findOneAndUpdate(
                { _id: context.user?._id, "pantry.id": ingredient.id },
                { $inc: { "pantry.$.quantity": ingredient.amount } },
                { new: true }
            )
          } else {
            const newIngredient = {
              id: ingredient.id,
              item: ingredient.name,
              quantity: ingredient.amount,
              unit: ingredient.unit,
            };
            Profile.findOneAndUpdate(
              { _id: context.user?._id },
              { $addToSet: { shoppingList: newIngredient } },
              { new: true }
            );
          }
        })
      }
      throw new AuthenticationError("Unauthenticated");
    },

    shoppingListToPantry: async (_parent: any, _args: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = await Profile.findOne({ _id: context.user._id }) as any;
        userProfile?.shoppingList.forEach(async (item: any) => {
          
        }
      }
      throw new AuthenticationError("You need to be logged in to move items from shopping list to pantry");
    },

    saveMealToDate: async (
      _parent: any,
      { date, meal }: { date: string; meal: string },
      context: Context
    ): Promise<Profile | null> => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to save a meal"
        );
      }

      try {
        const updatedProfile = await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { [`calendarMeals.${date}`]: meal } },
          { new: true, upsert: true }
        );
        return updatedProfile;
      } catch (error) {
        console.error("Failed to save meal to date:", error);
        throw new Error("Failed to save meal to date");
      }
    },

generateMeals: async (
  _parent: any,
  { year, month }: { year: number; month: number },
  context: Context
): Promise<Profile | null> => {
  if (!context.user) throw new AuthenticationError("Not logged in");

  const profile = await Profile.findOne({ _id: context.user._id });
  if (!profile) throw new Error("Profile not found");

  const today = new Date(year, month - 1); // JS 0-indexed
  const generatedMeals: Record<string, string[]> = {};

  const fetchRecipes = async (type: string | string[]) => {
    const Types = type[Math.floor(Math.random() * type.length)];
    const res = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?type=${Types}&number=7&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );
    console.log(`🌐 Fetching ${type} recipes from Spoonacular: ${res}`);
    const data = await res.json();

      if (!res.ok) {
    console.error(`❌ Failed to fetch ${type}:`, res.status, data);
  }

  if (!Array.isArray(data.results)) {
    console.error(`❌ Unexpected response for ${type}:`, data);
  }

    return data.results || [];
  };

  const fetchFullRecipe = async (id: number) => {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );
    return await res.json();
  };

  const [breakfasts, lunches, dinners] = await Promise.all([
    fetchRecipes(["breakfast"]),
    fetchRecipes(["side dish", "soup", "salad"]), // for lunch
    fetchRecipes("main course"), // for dinner
  ]);

  if (!breakfasts.length || !lunches.length || !dinners.length) {
  console.error("❌ Spoonacular returned no results:");
  console.error("Breakfasts:", breakfasts);
  console.error("Lunches:", lunches);
  console.error("Dinners:", dinners);
  throw new Error("Spoonacular returned empty results for at least one meal type.");
}

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const breakfast = breakfasts[i % breakfasts.length];
    const lunch = lunches[i % lunches.length];
    const dinner = dinners[i % dinners.length];

const mealRecipes = [breakfast, lunch, dinner];

for (const recipe of mealRecipes) {
  if (!recipe || !recipe.id) {
    console.warn(`⚠️ Skipping undefined or invalid recipe:`, recipe);
    continue;
  }

  const existing = await Recipe.findOne({ id: recipe.id });
  if (!existing) {
    const full = await fetchFullRecipe(recipe.id);

    if (!full || !full.id || !full.title) {
      console.warn(`⚠️ Invalid full recipe returned for id ${recipe.id}`, full);
      continue;
    }
      const transformed = transformRecipe(full);
      await Recipe.create(transformed);
  }
}

    generatedMeals[dateStr] = mealRecipes.map((r) => r.title);
  }

  const updatedMeals = {
    ...(profile.calendarMeals || {}),
    ...generatedMeals,
  };

  const updated = await Profile.findOneAndUpdate(
    { _id: context.user._id },
    { $set: { calendarMeals: updatedMeals } },
    { new: true }
  );

  console.log("✅ Weekly meals added:", generatedMeals);
  return updated;
},


    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.findOne({ email });
      if (!profile) {
        throw new AuthenticationError("invalid token 2");
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("invalid token 3");
      }
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    removeProfile: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        return await Profile.findOneAndDelete({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
};

export default resolvers;
