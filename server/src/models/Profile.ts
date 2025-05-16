import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IIngredient {
  item: string;
  quantity: number;
}

interface IRecipe {
  name: string;
  description: string;
  ingredients: IIngredient[];
  instructions: string[];
}

interface IProfile extends Document {
  _id: string;
  name: string;
  email: string;
  password:string;
  recipes: IRecipe[];
  isCorrectPassword(password: string): Promise<boolean>;
}

// Define the schema for the Profile document
const ingredientSchema = new Schema<IIngredient>({
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
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
  instructions: {
    type: [String],
    required: true,
  },
});

const profileSchema = new Schema<IProfile>(
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
      match: [/.+@.+\..+/, 'Must match an email address!'],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    recipes: [recipeSchema],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// set up pre-save middleware to create password
profileSchema.pre<IProfile>('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password assert the hashed password
profileSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const Profile = model<IProfile>('Profile', profileSchema);

export default Profile;
