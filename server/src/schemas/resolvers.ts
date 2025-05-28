import fetch from 'node-fetch';
// import { time } from 'node:console';
import { Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { searchRecipes as fetchSpoonacularRecipes} from '../utils/spoonacular.js';
import { searchRecipesByKeyword } from '../utils/spoonacularQueries.js';



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
      return await fetchSpoonacularRecipes();
    },
    searchRecipes: async (_parent: any, { keyword }: { keyword: string }): Promise<SpoonacularRecipe[]> => {
      return await searchRecipesByKeyword(keyword);
    },
  },
  Mutation: {
    addProfile: async (_parent: any, { input }: AddProfileArgs): Promise<{ token: string; profile: Profile }> => {
      const profile = await Profile.create({ ...input });
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },
    addRecipe: async (_parent: any, { id }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const spoonRecipeRes = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=15d0763886a54674b9f063f359c19d38`) as any;
        const spoonRecipe = await spoonRecipeRes.json();
        console.log(spoonRecipe);
        const recipe = {
          id: spoonRecipe.id,
          name: spoonRecipe.title,
          description: spoonRecipe.summary,
          image: spoonRecipe.image,
          ingredients: spoonRecipe?.extendedIngredients?.map((ingredient: any) => ({
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

    addtoPantry: async (_parent: any, { id, storage }: any, context: Context): Promise<Profile | null> => {
      if (context.user) {
        const spoonIngredientRes = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=15d0763886a54674b9f063f359c19d38`) as any;
        const spoonIngredient = await spoonIngredientRes.json();
        const ingredient = {
          item: spoonIngredient.name,
          quantity: spoonIngredient.amount,
          unit: spoonIngredient.unit,
          storage: storage 
        };
        return await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { pantry: ingredient } },
          { new: true }
        );
      }
      throw new AuthenticationError('invalid token 1')
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
  },
};

export default resolvers;
