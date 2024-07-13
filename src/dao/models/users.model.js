import mongoose from "mongoose";
import { cartsModel } from "./carts.model.js";

const usersColl = "users"

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    reference: { type: String, required: true } // Link al documento
});

const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String },
        email: { type: String, required: true, unique: true },
        age: { type: Number },
        password: { type: String },
        cart: { type: mongoose.Schema.Types.ObjectId, ref: cartsModel, unique: true },
        rol: { type: String, default: 'user' },
        documents: { type: [documentSchema], default: [] },
        last_connection: { type: String }
    },
    {
        timestamps: true, strict: false
    }
)

export const usersModel = mongoose.model(usersColl, userSchema)