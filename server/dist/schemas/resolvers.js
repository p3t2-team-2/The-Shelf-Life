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
