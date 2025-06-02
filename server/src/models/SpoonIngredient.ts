import { Schema, model, Document } from 'mongoose';


interface ISpoonIngredient extends Document {
  id: number;
  item: string;
}

const spoonIngredientSchema = new Schema<ISpoonIngredient>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    item: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const SpoonIngredient = model<ISpoonIngredient>('SpoonIngredient', spoonIngredientSchema);

export default SpoonIngredient;