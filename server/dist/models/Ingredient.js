import { Schema } from "mongoose";
const ingredientSchema = new Schema({
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
    storage: {
        type: String,
        required: false,
    },
});
export { ingredientSchema };
