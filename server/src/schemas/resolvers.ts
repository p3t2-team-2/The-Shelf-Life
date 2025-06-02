import fetch from 'node-fetch';
// import { time } from 'node:console';
import { Profile } from '../models/index.js';
import { IRecipe } from '../models/Recipe.js';
import { SpoonIngredient } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { searchRecipes, searchRecipesByKeyword} from '../utils/spoonacularQueries.js';



interface Profile {
  _id: string;
  name: string;
  email: string;
  password: string; 
}

interface ProfileArgs {
  profileId: string;
}

interface AddProfileArgs {
  input:{
    name: string;
    email: string;
    password: string;
  }
}

interface SpoonacularRecipe {
  id: number;
  name: string;
  image: string;
  // readyInMinutes: number;
  // servings: number;
  // sourceUrl: string;
}



interface Context {
  user?: Profile;
}

const resolvers = {
  Query: {
    profiles: async (): Promise<Profile[]> => {
      return await Profile.find();
    },
    profile: async (_parent: any, { profileId }: ProfileArgs): Promise<Profile | null> => {
      return await Profile.findOne({ _id: profileId });
    },
    me: async (_parent: any, _args: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        return await Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('invalid token');
    },
    ingredients: async (_parent: any, { keyword } : { keyword: string }): Promise<any[]> => {
      return await SpoonIngredient.find({ item: { $regex: keyword, $options: 'i' } });
    },
    spoonacularRecipes: async (_parent: any): 
    Promise<SpoonacularRecipe[]> => {     
      const recipes: any = await searchRecipes();
      console.log('recipes:', recipes);
      
      return recipes;
    },
    recipeById: async (_parent: any, { id }: { id: number }): Promise<IRecipe | null> => {
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=0132fcb5cc6e4595a04e81af0e23c2a6`);
      if (!response.ok) {
        throw new Error(`Error fetching recipe with ID ${id}: ${response.statusText}`);
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
          unit: ingredient.unit,
        })),
        instructions: recipeData.analyzedInstructions[0]?.steps.map((step: any) => ({
          number: step.number,
          step: step.step,
          time: step.length ? step.length.number : null, // Assuming length is optional
        })) || [],
      };
      return recipe;
    },
    searchRecipes: async (_parent: any, { keywords }: { keywords: string }): Promise<SpoonacularRecipe[]> => {
      return await searchRecipesByKeyword(keywords);
    },
    recommendedRecipes: async (_parent: any, _args: any, context: Context): Promise<SpoonacularRecipe[]> => {
      if (context.user) {
        const query: string[] = []
        const userProfile = await Profile.findOne({ _id: context.user._id }) as any;
        userProfile?.pantry.forEach((item: any) => {
          if (item.item) {
            query.push(item.item);
          }
        });
        return await searchRecipesByKeyword(query) as Promise<SpoonacularRecipe[]>;
      }
      throw new AuthenticationError('You need to be logged in to get recommended recipes');
    }
  },
  Mutation: {
    addProfile: async (_parent: any, { input }: AddProfileArgs): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    addRecipe: async (_parent: any, { id }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const spoonRecipeRes = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=0132fcb5cc6e4595a04e81af0e23c2a6`) as any;
        const spoonRecipe = await spoonRecipeRes.json();
        const recipe = {
          id: spoonRecipe.id,
          name: spoonRecipe.title,
          description: spoonRecipe.summary,
          image: spoonRecipe.image,
          ingredients: spoonRecipe?.extendedIngredients?.map((ingredient: any) => ({
            id: ingredient.id,
            item: ingredient.name,
            quantity: ingredient.amount,
            unit: ingredient.unit,
          })),
          instructions: spoonRecipe?.analyzedInstructions[0]?.steps?.map((step: any) => ({
            number: step.number,
            step: step.step,
            time: step.length ? step.length.number : null,
          })),
        };
        console.log(spoonRecipe.title);
        
        return await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { recipes: recipe } },
          { new: true }
        );
      }
      throw new AuthenticationError('invalid token 1');
    },
    removeRecipe: async (_parent: any, { id }: any , context: Context): Promise<Profile | null> => {
      if (context.user) {
        const profile = await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { recipes: {id: id}} },
          { new: true }
        );
        return profile;
      }
      throw new AuthenticationError('You need to be logged in to remove favorite recipes');
    },

    addtoPantry: async (_parent: any, { id, storage, unit, quantity }: any, context: Context): Promise<Profile | null> => {
    if (context.user) {
    const userProfile = await Profile.findOne({ _id: context.user._id }) as any;
    const existingItem = userProfile?.pantry.find((item: any) => item.id === id);

     if (existingItem) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { _id: context.user._id, 'pantry.id': id },
        { $inc: { 'pantry.$.quantity': quantity } },
        { new: true }
      );
      return updatedProfile;
    }
        const spoonIngredientRes = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=0132fcb5cc6e4595a04e81af0e23c2a6`) as any;
        const spoonIngredient = await spoonIngredientRes.json();
        console.log(spoonIngredient);
        const ingredient = {
          id: spoonIngredient.id,
          item: spoonIngredient.name,
          quantity: quantity,
          unit: unit,
          storage: storage 
        };
        console.log(ingredient);
        return await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { pantry: ingredient } },
          { new: true }
        );
      }
      throw new AuthenticationError('invalid token 1')
    },

    increasePantryItem: async (_parent: any, { id, quantity, unit}: any, context: Context): Promise<Profile | null> => { 
      if (context.user) {
        const userProfile = await Profile.findOne({ _id: context.user._id }) as any;
        const pantryItem = userProfile?.pantry.find((item: any) => item.id === id);
        const  storedUnit  =  pantryItem?.unit;
        if (!userProfile?.pantry.some((item: any) => item.id === id)) {
          throw new Error('Item does not exists in pantry');
        }
        if (storedUnit === unit) {
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, 'pantry.id': id },
            { $inc: { 'pantry.$.quantity': quantity } },
            { new: true }
          );
          return profile; 
        } else { 
          console.log("hi");
          const conversionRes = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=0132fcb5cc6e4595a04e81af0e23c2a6`) as any;
          console.log('conversionRes:', conversionRes);
          const conversionData = await conversionRes.json();
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, 'pantry.id': id },
            { $inc: { 'pantry.$.quantity': conversionData.targetAmount } },
            { new: true }
          );
          return profile;
        }
      }
      throw new AuthenticationError('You need to be logged in to increase pantry items');
    },

    decreasePantryItem: async (_parent: any, { id, quantity, unit }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const userProfile = await Profile.findOne({ _id: context.user._id }) as any;
        const pantryItem = userProfile?.pantry.find((item: any) => item.id === id);
        const storedUnit = pantryItem?.unit;
        if (!userProfile?.antry.some((item: any) => item.id === id)) {
          throw new Error('Item does not exists in pantry');
        } 
        if (pantryItem?.quantity < quantity) {
          throw new Error('Insufficient quantity in pantry');
        }
        if (storedUnit === unit) {
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, 'pantry.id': id },
            { $inc: { 'pantry.$.quantity': -quantity } },
            { new: true }
          );
          return profile;
        } else {
          const conversionRes = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=0132fcb5cc6e4595a04e81af0e23c2a6`) as any;
          console.log('conversionRes:', conversionRes);
          const conversionData = await conversionRes.json();
          const profile = await Profile.findOneAndUpdate(
            { _id: context.user._id, 'pantry.id': id },
            { $inc: { 'pantry.$.quantity': -conversionData.targetAmount } },
            { new: true }
          );
          return profile;
        }
      }
      throw new AuthenticationError('You need to be logged in to decrease pantry items');
    },
    
    removeFromPantry: async (_parent: any, { id }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const profile = await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { pantry: { id: id } } },
          { new: true }
        );
        return profile;
      }
      throw new AuthenticationError('You need to be logged in to remove items from your pantry');
    },
    
    login: async (_parent: any, { email, password }: { email: string; password: string }): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.findOne({ email });
      if (!profile) {
        throw new AuthenticationError('invalid token 2');
      }
      const correctPw = await profile.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('invalid token 3');
      }
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    removeProfile: async (_parent: any, _args: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        return await Profile.findOneAndDelete({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
    // Add favorite recipe to user's profile
    // addFavoriteRecipe: async (_parent: any, { recipeId }: { recipeId: string }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const profile = await Profile.findOneAndUpdate(
    //       { _id: context.user._id },
    //       { $addToSet: { favoriteRecipes: recipeId } },
    //       { new: true }
    //     );
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to add favorite recipes');
    // },
    // Remove favorite recipe from user's profile
    // removeFavoriteRecipe: async (_parent: any, { recipeId }: { recipeId: string }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const profile = await Profile.findOneAndUpdate(
    //       { _id: context.user._id },
    //       { $pull: { favoriteRecipes: recipeId } },
    //       { new: true }
    //     );
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to remove favorite recipes');
    // },
    // Add pantry item to user's profile
    // addPantryItem: async (_parent: any, { name, quantity }: { name: string; quantity: number }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const profile = await Profile.findOneAndUpdate(
    //       { _id: context.user._id },
    //       { $push: { pantryItems: { name, quantity } } },
    //       { new: true }
    //     );
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to add pantry items');
    // },
    // Remove pantry item from user's profile
    // removePantryItem: async (_parent: any, { itemId }: { itemId: string }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const profile = await Profile.findOneAndUpdate(
    //       { _id: context.user._id }, 
    //       { $pull: { pantryItems: { _id: itemId } } },
    //       { new: true }
    //     );
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to remove pantry items');
    // },
    // Update pantry item in user's profile
    // updatePantryItem: async (_parent: any, { itemId, name, quantity }: { itemId: string; name?: string; quantity?: number }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const updateFields: any = {};
    //     if (name) updateFields['pantryItems.$.name'] = name;
    //     if (quantity) updateFields['pantryItems.$.quantity'] = quantity;
    //     const profile = await Profile.findOneAndUpdate(
    //       { _id: context.user._id, 'pantryItems._id': itemId },
    //       { $set: updateFields },
    //       { new: true }
    //     );
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to update pantry items');
    // },
    // Cook a meal and remove ingredients from pantry
    // cookMeal: async (_parent: any, { recipeId }: { recipeId: string }, context: Context): Promise<Profile | null> => {
    //   if (context.user) {
    //     const recipe = await Recipe.findById(recipeId);
    //     if (!recipe) {
    //       throw new Error('Recipe not found');
    //     }
    //     const profile = await Profile.findOne({ _id: context.user._id });
    //     if (!profile) {
    //       throw new AuthenticationError('User not found');
    //     }
    //     // Assuming recipe.ingredients is an array of ingredient names
    //     for (const ingredient of recipe.ingredients) {
    //       await Profile.findOneAndUpdate(
    //         { _id: context.user._id, 'pantryItems.name': ingredient },
    //         { $pull: { pantryItems: { name: ingredient } } }
    //       );
    //     }
    //     return profile;
    //   }
    //   throw new AuthenticationError('You need to be logged in to cook meals');
    // },

  },
};

export default resolvers;
