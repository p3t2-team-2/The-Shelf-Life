import { Schema, model, Document } from "mongoose";

interface ISpoonIngredient extends Document {
  id: number;
  item: string;
  unit?: string[]; // Optional field for unit
}

const spoonIngredientSchema = new Schema<ISpoonIngredient>(
  {
    id: {
      type: Number,
      required: true,
      // unique: true,
    },
    item: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: [String], // Array of strings for units
      default: [], // Default to an empty array if no units are provided
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const SpoonIngredient = model<ISpoonIngredient>(
  "SpoonIngredient",
  spoonIngredientSchema
);

export { SpoonIngredient, ISpoonIngredient };
