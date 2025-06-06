import { model, Document } from "mongoose";
import { ingredientSchema, IIngredient } from "./Ingredient.js";
import { recipeSchema, IRecipe } from "./Recipe.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// interface ICalendarMeals {
//   type: Map<string, string[]>;
//   of: string[];
//   default: {};
// }

interface IProfile extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  pantry?: IIngredient[];
  shoppingList?: IIngredient[];
  recipes?: IRecipe[];
  calendarMeals?: Record<string, string[]>; // Assuming calendar meals are stored as a record of recipe arrays by date
  isCorrectPassword(password: string): Promise<boolean>;
}


// Define the schema for the Profile document

const profileSchema = new mongoose.Schema<IProfile>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must match an email address!"],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    shoppingList: [ingredientSchema],
    pantry: [ingredientSchema],
    recipes: [recipeSchema],
    calendarMeals: {
      type: mongoose.Schema.Types.Mixed,
      of: [String],
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// set up pre-save middleware to create password
profileSchema.pre<IProfile>("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password assert the hashed password
profileSchema.methods.isCorrectPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
