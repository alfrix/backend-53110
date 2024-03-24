import mongoose from "mongoose";

const chatsColl = "chats"
const chatsSchema = new mongoose.Schema(
    {
        user: { type:String, required: true},
        message: { type:String, required: true},
    },
    {
        timestamps: true
    }
)

export const chatsModel = mongoose.model(chatsColl, chatsSchema)