import mongoose from "mongoose";

const cartsColl = "carts"
const cartsSchema = new mongoose.Schema(
    {
        products: [{ pid: Number, quantity: Number }],
        id: { type:Number, required: true},
    },
    {
        timestamps: true
    }
)

export const cartsModel = mongoose.model(cartsColl, cartsSchema)
