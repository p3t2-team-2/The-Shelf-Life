import fetch from 'node-fetch';
// import { time } from 'node:console';
import { Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { searchRecipes as fetchSpoonacularRecipes } from '../utils/spoonacular.js';
import { searchRecipesByKeyword } from '../utils/spoonacularQueries.js';
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
                const id = 5064;
                const userProfile = await Profile.findOne({ _id: context.user._id });
                const pantryItem = userProfile?.pantry.find((item) => item.id === id);
                console.log('pantryItem:', pantryItem);
                return await Profile.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('invalid token');
        },
        spoonacularRecipes: async (_parent) => {
            return await fetchSpoonacularRecipes();
        },
        // searchRecipes: async (_parent: any, { keyword }: { keyword: string }): Promise<SpoonacularRecipe[]> => {
        //   return await searchRecipesByKeyword(keyword);
        // },
        recommendedRecipes: async (_parent, _args, context) => {
            if (context.user) {
                const query = [];
                const userProfile = await Profile.findOne({ _id: context.user._id });
                userProfile?.pantry.forEach((item) => {
                    if (item.item) {
                        query.push(item.item);
                    }
                });
                return await searchRecipesByKeyword(query);
            }
        }
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
        addtoPantry: async (_parent, { id, storage, unit, quantity }, context) => {
            if (context.user) {
                const userProfile = await Profile.findOne({ _id: context.user._id });
                if (userProfile?.pantry.some((item) => item.id === id)) {
                    throw new Error('Item already exists in pantry');
                }
                const spoonIngredientRes = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=15d0763886a54674b9f063f359c19d38`);
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
                return await Profile.findOneAndUpdate({ _id: context.user._id }, { $addToSet: { pantry: ingredient } }, { new: true });
            }
            throw new AuthenticationError('invalid token 1');
        },
        increasePantryItem: async (_parent, { id, quantity, unit }, context) => {
            if (context.user) {
                const userProfile = await Profile.findOne({ _id: context.user._id });
                const pantryItem = userProfile?.pantry.find((item) => item.id === id);
                const storedUnit = pantryItem?.unit;
                if (!userProfile?.antry.some((item) => item.id === id)) {
                    throw new Error('Item does not exists in pantry');
                }
                if (storedUnit === unit) {
                    const profile = await Profile.findOneAndUpdate({ _id: context.user._id, 'pantry.id': id }, { $inc: { 'pantry.$.quantity': quantity } }, { new: true });
                    return profile;
                }
                else {
                    console.log("hi");
                    const conversionRes = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=15d0763886a54674b9f063f359c19d38`);
                    console.log('conversionRes:', conversionRes);
                    const conversionData = await conversionRes.json();
                    const profile = await Profile.findOneAndUpdate({ _id: context.user._id, 'pantry.id': id }, { $inc: { 'pantry.$.quantity': conversionData.targetAmount } }, { new: true });
                    return profile;
                }
            }
            throw new AuthenticationError('You need to be logged in to increase pantry items');
        },
        decreasePantryItem: async (_parent, { id, quantity, unit }, context) => {
            if (context.user) {
                const userProfile = await Profile.findOne({ _id: context.user._id });
                const pantryItem = userProfile?.pantry.find((item) => item.id === id);
                const storedUnit = pantryItem?.unit;
                if (!userProfile?.antry.some((item) => item.id === id)) {
                    throw new Error('Item does not exists in pantry');
                }
                if (pantryItem?.quantity < quantity) {
                    throw new Error('Insufficient quantity in pantry');
                }
                if (storedUnit === unit) {
                    const profile = await Profile.findOneAndUpdate({ _id: context.user._id, 'pantry.id': id }, { $inc: { 'pantry.$.quantity': -quantity } }, { new: true });
                    return profile;
                }
                else {
                    const conversionRes = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=something&sourceUnit=${unit}&sourceAmount=${quantity}&targetUnit=grams&apiKey=15d0763886a54674b9f063f359c19d38`);
                    console.log('conversionRes:', conversionRes);
                    const conversionData = await conversionRes.json();
                    const profile = await Profile.findOneAndUpdate({ _id: context.user._id, 'pantry.id': id }, { $inc: { 'pantry.$.quantity': -conversionData.targetAmount } }, { new: true });
                    return profile;
                }
            }
            throw new AuthenticationError('You need to be logged in to decrease pantry items');
        },
        removeFromPantry: async (_parent, { id }, context) => {
            if (context.user) {
                const profile = await Profile.findOneAndUpdate({ _id: context.user._id }, { $pull: { pantry: { id: id } } }, { new: true });
                return profile;
            }
            throw new AuthenticationError('You need to be logged in to remove items from your pantry');
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
