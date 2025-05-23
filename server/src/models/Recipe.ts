import { Schema } from 'mongoose';
import { ingredientSchema, IIngredient } from './Ingredient';

interface IStep {
  number: number;
  step: string;
  time: string; 
}

interface IRecipe {
  name: string;
  description: string;
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
    required: true
  }
})

const recipeSchema = new Schema<IRecipe>({
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

export {recipeSchema, IRecipe}





