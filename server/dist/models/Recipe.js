import { Schema, model } from 'mongoose';
import { ingredientSchema } from './Ingredient.js';
const stepSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    step: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: false
    }
});
const recipeSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    ingredients: [ingredientSchema],
    instructions: [stepSchema],
});
const Recipe = model('Recipe', recipeSchema);
export { recipeSchema, Recipe };
