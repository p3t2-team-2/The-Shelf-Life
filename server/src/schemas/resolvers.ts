import { Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { searchRecipes, searchRecipesByKeyword } from '../utils/spoonacularQueries.js';


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
  title: string;
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
    spoonacularRecipes: async (_parent: any): 
    Promise<SpoonacularRecipe[]> => {     
      const recipes: any = await searchRecipes();
      console.log('recipes:', recipes);
      
      return recipes;
    },
    spoonacularRecipesByKeyword: async (_parent: any, { keyword }: { keyword: string }): Promise<SpoonacularRecipe[]> => {
      const recipes: any = await searchRecipesByKeyword(keyword);
      console.log('recipes:', recipes);
      
      return recipes;
    },
    // Get all favorite recipes for the logged-in user
    // favoriteRecipes: async (_parent: any, _args: any, context: Context): Promise<Recipe[]> => {
    //   if (context.user) {
    //     return await Recipe.find({ _id: { $in: context.user.favoriteRecipes } });
    //   }
    //   throw new AuthenticationError('You need to be logged in to view favorite recipes');
    // },
    // Get all items currently in pantry
    // allPantryItems: async (_parent: any, _args: any, context: Context): Promise<PantryItem[]> => {
    //   if (context.user) {
    //     return await PantryItem.find({ userId: context.user._id });
    //   }
    //   throw new AuthenticationError('You need to be logged in to view pantry items');
    // },
    // Get refrigerated items in pantry
    // allRefrigeratedItems: async (_parent: any, _args: any, context: Context): Promise<PantryItem[]> => {
    //   if (context.user) {
    //     return await PantryItem.find({ userId: context.user._id, category: 'refrigerated' });
    //   }
    //   throw new AuthenticationError('You need to be logged in to view refrigerated items');
    // },
    // Get frozen items in pantry
    // allFrozenItems: async (_parent: any, _args: any, context: Context): Promise<PantryItem[]> => {
    //   if (context.user) {
    //     return await PantryItem.find({ userId: context.user._id, category: 'frozen' });
    //   }
    //   throw new AuthenticationError('You need to be logged in to view frozen items');
    // },
    // Get dry goods in pantry  
    // allDryGoods: async (_parent: any, _args: any, context: Context): Promise<PantryItem[]> => {
    //   if (context.user) {
    //     return await PantryItem.find({ userId: context.user._id, category: 'dry goods' });
    //   }
    //   throw new AuthenticationError('You need to be logged in to view dry goods');
    // },
  },
  Mutation: {
    addProfile: async (_parent: any, { input }: AddProfileArgs): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
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
