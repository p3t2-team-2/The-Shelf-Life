import { Schema } from 'mongoose';

interface IIngredient {
  item: string;
  quantity: number;
  unit: string; 
  storage?: string;
}

const ingredientSchema = new Schema<IIngredient>({
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    repuired: true,
  },
  storage:{
    type: String,
    required: true
  }
});

export {ingredientSchema, IIngredient}