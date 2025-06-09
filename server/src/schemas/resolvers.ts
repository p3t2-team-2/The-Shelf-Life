import fetch from "node-fetch";
// import { time } from 'node:console';
import { Profile } from "../models/index.js";
import { IRecipe } from "../models/Recipe.js";
import { SpoonIngredient } from "../models/index.js";
// import { ISpoonIngredient } from '../models/SpoonIngredient.js';
import { signToken, AuthenticationError } from "../utils/auth.js";
import {
  searchRecipes,
  searchRecipesByKeyword,
  searchRecipesByIngredients
} from "../utils/spoonacularQueries.js";
// import { getIngredientInfoByName } from "../utils/spoonacularMutations.js";
import { GraphQLJSON } from "graphql-type-json";
// import { get } from "mongoose";
// import { transformRecipe } from "../utils/spoonacularMutations.js";

interface Profile {
  _id: string;
  name: string;
  email: string;
  password: string;
  calendarMeals?: Record<string, Record<string ,string[]>>;
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
        return (await searchRecipesByIngredients(query)) as Promise<
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
          let passedValue = quantity;
          if (existingItem.unit !== unit) {
            const conversionRes = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceAmount=${quantity}&sourceUnit=${unit}&targetUnit=${existingItem.unit}&apiKey=${process.env.SPOONACULAR_API_KEY}`);
            const conversionData = await conversionRes.json();
            passedValue += conversionData.targetAmount;
          }
          const updatedProfile = await Profile.findOneAndUpdate(
            { _id: context.user._id, "pantry.id": id },
            { $inc: { "pantry.$.quantity": passedValue } },
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
              if (pantryItem.quantity - ingredient.amount <= 0) {
                // Remove the item from pantry if quantity is zero or less
                await Profile.findOneAndUpdate(
                  { _id: context.user._id },
                  { $pull: { pantry: { id: ingredient.id } } },
                  { new: true }
                );
              }
            }else {
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

    addtoShoppingList: async (
      _parent: any,
      { id }: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        const rescipeRes = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
        );
        const recipe = await rescipeRes.json();
        // console.log("recipe:", recipe);
        // console.log(userProfile?.shoppingList);
        for (const ingredient of recipe?.extendedIngredients) {
          if (
            userProfile?.shoppingList?.some(
              (item: any) => item.id === ingredient.id
            )
          ) {
            let userIngredient = userProfile.shoppingList.find(
              (item: any) => item.id === ingredient.id
            );
            if (ingredient.unit !== userIngredient.unit) {
              let conversionRes = await fetch(
                `https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${ingredient.unit}&sourceAmount=${ingredient.amount}&targetUnit=${userIngredient.unit}&apiKey=${process.env.SPOONACULAR_API_KEY}`
              );
              let conversionData = await conversionRes.json();
              ingredient.amount = conversionData.targetAmount;
            }
            // console.log("ingredient:", ingredient);
            await Profile.findOneAndUpdate(
              { _id: context.user._id, "shoppingList.id": ingredient.id },
              { $inc: { "shoppingList.$.quantity": ingredient.amount } },
              { new: true }
            );
          } else {
            // console.log("ingredient:", ingredient);
            const spoonIngredient = await SpoonIngredient.findOne({
              id: ingredient.id,
            });
            if (!spoonIngredient) {
              // console.log("Creating new SpoonIngredient:")
              await SpoonIngredient.create({
                id: ingredient.id,
                item: ingredient.name,
                unit: ingredient.unit,
              });
            }
            const newIngredient = {
              id: ingredient.id,
              item: ingredient.name,
              quantity: ingredient.amount,
              unit: ingredient.unit,
            };
            // console.log(context.user?._id);
            // console.log("newIngredient:", newIngredient);

            await Profile.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { shoppingList: newIngredient } },
              { new: true }
            );
          }
        }
        return await Profile.findOne({ _id: context.user?._id }, { new: true });
      }
      throw new AuthenticationError("Unauthenticated");
    },

    shoppingListToPantry: async (
      _parent: any,
      _args: any,
      context: Context
    ): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = (await Profile.findOne({
          _id: context.user._id,
        })) as any;
        for (const item of userProfile.shoppingList) {
          if (
            userProfile.pantry.some(
              (pantryItem: any) => pantryItem.id === item.id
            )
          ) {
            let pantryItem = userProfile.pantry.find(
              (pantryItem: any) => pantryItem.id === item.id
            );
            if (pantryItem.unit !== item.unit) {
              let conversionRes = await fetch(
                `https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${item.unit}&sourceAmount=${item.quantity}&targetUnit=${pantryItem.unit}&apiKey=${process.env.SPOONACULAR_API_KEY}`
              );
              let conversionData = await conversionRes.json();
              item.quantity = conversionData.targetAmount;
            }
            // console.log("item:", item);
            await Profile.findOneAndUpdate(
              { _id: context.user?._id, "pantry.id": item.id },
              { $inc: { "pantry.$.quantity": item.quantity } },
              { new: true }
            );
          } else {
            const newIngredient = {
              id: item.id,
              item: item.item,
              quantity: item.quantity,
              unit: item.unit,
              storage: "Fridge", // Default storage type
            };
            await Profile.findOneAndUpdate(
              { _id: context.user?._id },
              { $addToSet: { pantry: newIngredient } },
              { new: true }
            );
          }
          await Profile.findOneAndUpdate(
            { _id: context.user?._id },
            { $pull: { shoppingList: { id: item.id } } },
            { new: true }
          );
        }
        return await Profile.findOne({ _id: context.user._id }, { new: true });
      }
      throw new AuthenticationError(
        "You need to be logged in to move items from shopping list to pantry"
      );
    },

    removeFromShoppingList: async (
  _parent: any,
  { id }: { id: number },
  context: Context
): Promise<Profile | null> => {
  if (!context.user) throw new AuthenticationError("Unauthenticated");

  await Profile.findOneAndUpdate(
    { _id: context.user._id },
    { $pull: { shoppingList: { id: id } } },
    { new: true }
  );

  return await Profile.findOne({ _id: context.user._id });
},

  clearShoppingList: async (
  _parent: any,
  _args: any,
  context: Context
): Promise<Profile | null> => {
  if (!context.user) throw new AuthenticationError("Unauthenticated");

  await Profile.findOneAndUpdate(
    { _id: context.user._id },
    { $set: { shoppingList: [] } },
    { new: true }
  );

  return await Profile.findOne({ _id: context.user._id });
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

   removeMealFromDate: async (_parent: any,{ date, index, category }: { date: string; index: number; category: string },context: Context): Promise<Profile | null> => {
  if (!context.user) throw new AuthenticationError("Unauthenticated");

  const userProfile = await Profile.findOne({ _id: context.user._id });
  if (!userProfile) throw new Error("User not found");

  // Safely parse calendarMeals
  let calendar: Record<string, Record<string ,string[]>> = {
    breakfast: {},
    lunch: {},
    dinner: {}
  };;
  try {
    if (typeof userProfile.calendarMeals === "string") {
      calendar = JSON.parse(userProfile.calendarMeals);
    } else if (typeof userProfile.calendarMeals === "object" && userProfile.calendarMeals !== null) {
      calendar = userProfile.calendarMeals;
    }
  } catch (err) {
    console.error("❌ Failed to parse calendarMeals:", err);
    calendar = {};
  }

  // Ensure the key exists and index is in bounds
  if (Array.isArray(calendar[category][date]) && calendar[category][date][index] !== undefined) {
    calendar[category][date].splice(index, 1);
    if (calendar[category][date].length === 0) delete calendar[category][date];
  } else {
  console.warn(`⚠️ Attempted to remove meal from invalid category/date/index: ${category}, ${date}, ${index}`);
  }

  await Profile.findByIdAndUpdate(
    context.user._id,
    { $set: { calendarMeals: calendar } },
    { new: true }
  );

  return await Profile.findOne({ _id: context.user._id });
},

addMealToDate: async (_parent: any, { date, id, category }: { date: string; id: number; category: string }, context: Context) => {
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in to add a meal.");
  }

  const userProfile = await Profile.findOne({ _id: context.user._id });
  if (!userProfile) {
    throw new Error("User not found");
  }

  // Initialize default calendar structure if needed
  let mealcalendar: Record<string, Record<string, any[]>> = userProfile.calendarMeals || {
    breakfast: {},
    lunch: {},
    dinner: {},
  };

  // Initialize category if it doesn't exist
  if (!mealcalendar[category]) {
    mealcalendar[category] = {};
  }

  // Initialize date if it doesn't exist for the category
  if (mealcalendar[category][date] === undefined) {
    const recipe = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`);
    const recipeData = await recipe.json();
    mealcalendar[category][date] = [{ title: recipeData.title, id: recipeData.id }];
  } else {
    // Optional: Add to existing list (if you want multiple meals per day per category)
    // const recipe = await fetch(...);
    // mealcalendar[category][date].push({ ... });
  }
  console.log("mealcalendar:", mealcalendar[category]);

  await Profile.findByIdAndUpdate(
    context.user._id,
    { $set: { calendarMeals: mealcalendar } },
    { new: true }
  );

  return userProfile;
},



    // removeMealFromDate: async (
    //   _parent: any,
    //   { date, index }: { date: string; index: number },
    //   context: Context
    // ): Promise<Profile | null> => {
    //   if (!context.user) {
    //     throw new AuthenticationError("You need to be logged in to remove a meal.");
    //   }

    //   const user = await Profile.findById(context.user._id);
    //   if (!user || !user.calendarMeals || !user.calendarMeals[date]) {
    //     throw new Error("No meals found for that date.");
    //   }

    //   const meals = [...user.calendarMeals[date]];
    //   meals.splice(index, 1);

    //   const updatedProfile = await Profile.findByIdAndUpdate(
    //     context.user._id,
    //     { $set: { [`calendarMeals.${date}`]: meals } },
    //     { new: true }
    //   );

    //   return updatedProfile;
    // },

  generateMeals: async (_parent: any, { year, month, weekStart }: { year: number; month: number; weekStart: number }, context: Context ): Promise<Profile | null> => {
  if (!context.user) throw new AuthenticationError("Unauthenticated");
  console.log("context.user:", process.env.SPOONACULAR_API_KEY);
  console.log("📅 Generating meals for week:", { year, month, weekStart });

  const userProfile = await Profile.findOne({ _id: context.user._id });
  if (!userProfile) {
    console.error("❌ User not found");
    throw new Error("User not found");
  }
  const calendarMeals = userProfile.calendarMeals || {};

  // Parse or initialize calendarMeals
  // let calendar: Record<string, Record<string ,string[]>> = {
  //   breakfast: {},
  //   lunch: {},
  //   dinner: {}
  // };
  // try {
  //   calendar =
  //     typeof userProfile.calendarMeals === "string"
  //       ? JSON.parse(userProfile.calendarMeals)
  //       : userProfile.calendarMeals || {};
  // } catch (err) {
  //   console.error("❌ Error parsing calendarMeals:", err);
  //   calendar = {};
  // }

  const baseDate = new Date(year, month - 1, weekStart);

  // Fetch recipes from Spoonacular
  console.log("breakfast");
  await genMeals(baseDate, "breakfast", calendarMeals);
  console.log("lunch");
  await genMeals(baseDate, "lunch", calendarMeals);
  console.log("dinner");
  await genMeals(baseDate, "dinner", calendarMeals);

  
  // Save back to MongoDB
  await Profile.findByIdAndUpdate(
    context.user._id,
    { $set: { calendarMeals: calendarMeals } },
    { new: true }
  );

  console.log("✅ Meals saved to calendar");

  return await Profile.findOne({ _id: context.user._id });
},

    login: async (
      _parent: any,
      { email, password }: { email: string; password: string }
    ): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.findOne({ email });
      if (!profile) {
        throw new AuthenticationError("Incorrect email. Please try again.");
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect password. Please try again.");
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


const genMeals = async (
  baseDate: Date,
  category: "breakfast" | "lunch" | "dinner",
  calendar: Record<string, Record<string, any[]>>
) => {
  const typeMap: Record<string, string> = {
    breakfast: "breakfast",
    lunch: "main course",
    dinner: "main course"
  };

  const type = typeMap[category];
  const url = `https://api.spoonacular.com/recipes/complexSearch?type=${type}&number=7&addRecipeInformation=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Spoonacular API error: ${res.status}`, errBody);
    throw new Error(`Failed to fetch recipes: ${res.status}`);
  }

  const data = await res.json();
  const recipes = data?.results?.map((r: any) => ({
    title: r.title,
    id: r.id,
    image: r.image,
  })) || [];

  if (!calendar[category]) calendar[category] = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    calendar[category][dateStr] = [recipes[i] || { title: `Meal ${i + 1}` }];
  }
};

export default resolvers;
