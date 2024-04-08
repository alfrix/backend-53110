import mongoose from "mongoose";

const usersColl = "users"
const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true},
        last_name: { type: String, required: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        age: { type: Number, required: false }
    },
    {
        timestamps: true
    }
)

export const usersModel = mongoose.model(usersColl, userSchema)