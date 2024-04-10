import mongoose from "mongoose";

const usersColl = "users"
const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        age: { type: Number },
        rol: { type: String }
    },
    {
        timestamps: true, strict: false
    }
)

export const usersModel = mongoose.model(usersColl, userSchema)