import { Schema } from 'mongoose';

interface IIngredient {
  id: number;
  item: string;
  quantity: number;
  unit: string; 
  storage?: string;
}

const ingredientSchema = new Schema<IIngredient>({
  id: {
    type: Number,
    required: true,
  },
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