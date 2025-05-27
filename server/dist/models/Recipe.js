import { Schema } from 'mongoose';
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
        required: true
    }
});
const recipeSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
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
export { recipeSchema };
