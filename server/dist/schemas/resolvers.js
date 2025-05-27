import fetch from 'node-fetch';
// import { time } from 'node:console';
import { Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { searchRecipes as fetchSpoonacularRecipes } from '../utils/spoonacular.js';
const resolvers = {
    Query: {
        profiles: async () => {
            return await Profile.find();
        },
        profile: async (_parent, { profileId }) => {
            return await Profile.findOne({ _id: profileId });
        },
        me: async (_parent, _args, context) => {
            if (context.user) {
                return await Profile.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('invalid token');
        },
        spoonacularRecipes: async (_parent) => {
            return await fetchSpoonacularRecipes();
        },
    },
    Mutation: {
        addProfile: async (_parent, { input }) => {
            const profile = await Profile.create({ ...input });
            const token = signToken(profile.name, profile.email, profile._id);
            return { token, profile };
        },
        addRecipe: async (_parent, { id }, context) => {
            if (context.user) {
                const spoonRecipeRes = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=15d0763886a54674b9f063f359c19d38`);
                const spoonRecipe = await spoonRecipeRes.json();
                console.log(spoonRecipe);
                const recipe = {
                    id: spoonRecipe.id,
                    name: spoonRecipe.title,
                    description: spoonRecipe.summary,
                    image: spoonRecipe.image,
                    ingredients: spoonRecipe?.extendedIngredients?.map((ingredient) => ({
                        item: ingredient.name,
                        quantity: ingredient.amount,
                        unit: ingredient.unit,
                    })),
                    instructions: spoonRecipe?.analyzedInstructions[0]?.steps?.map((step) => ({
                        number: step.number,
                        step: step.step,
                        time: step.length ? step.length.number : null,
                    })),
                };
                return await Profile.findOneAndUpdate({ _id: context.user._id }, { $addToSet: { recipes: recipe } }, { new: true });
            }
            throw new AuthenticationError('invalid token 1');
        },
        removeRecipe: async (_parent, { id }, context) => {
            if (context.user) {
                const profile = await Profile.findOneAndUpdate({ _id: context.user._id }, { $pull: { recipes: { id: id } } }, { new: true });
                return profile;
            }
            throw new AuthenticationError('You need to be logged in to remove favorite recipes');
        },
        login: async (_parent, { email, password }) => {
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
        removeProfile: async (_parent, _args, context) => {
            if (context.user) {
                return await Profile.findOneAndDelete({ _id: context.user._id });
            }
            throw AuthenticationError;
        },
    },
};
export default resolvers;
