import { Schema, model } from 'mongoose';
import { ingredientSchema, IIngredient } from './Ingredient.js';

interface IStep {
  number: number;
  step: string;
  time?: string; 
}

interface IRecipe {
  id: number;
  name: string;
  description: string;
  image: string;
  ingredients: IIngredient[];
  instructions: IStep[];
}

const stepSchema = new Schema<IStep>({
  number: {
    type: Number,
    required: true
  },
  step:{
    type: String,
    required: true
  },
  time:{
    type: String,
    required: false
  }
})

const recipeSchema = new Schema<IRecipe>({
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

const Recipe = model<IRecipe>('Recipe', recipeSchema);

export {recipeSchema, IRecipe, Recipe}





