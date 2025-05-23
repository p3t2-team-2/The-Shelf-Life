import { Schema } from 'mongoose';
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
export { ingredientSchema };
