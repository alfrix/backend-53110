import mongoose from "mongoose";

const cartsColl = "carts"
const cartsSchema = new mongoose.Schema(
    {
        products: { type:Array, required: true},
        id: { type:Number, required: true},
    },
    {
        timestamps: true
    }
)

export const cartsModel = mongoose.model(cartsColl, cartsSchema)
