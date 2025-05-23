import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
// Define the schema for the Profile document
const ingredientSchema = new Schema({
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
    }
});
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
const profileSchema = new Schema({
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
    pantry: [ingredientSchema],
    recipes: [recipeSchema],
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});
// set up pre-save middleware to create password
profileSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});
// compare the incoming password assert the hashed password
profileSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
const Profile = model('Profile', profileSchema);
export default Profile;
