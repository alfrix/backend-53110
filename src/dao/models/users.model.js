import mongoose from "mongoose";
import { cartsModel } from "./carts.model.js";

const usersColl = "users"
const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String },
        email: { type: String, required: true, unique: true },
        age: { type: Number },
        password: { type: String },
        cart: { type: mongoose.Schema.Types.ObjectId, ref: cartsModel, unique: true  },
        rol: { type: String, default: 'user' }
    },
    {
        timestamps: true, strict: false
    }
)

export const usersModel = mongoose.model(usersColl, userSchema)