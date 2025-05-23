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

  },
};

export default resolvers;
