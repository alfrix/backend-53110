import mongoose from "mongoose";
import { productsModel } from "./products.model.js";

const cartsColl = "carts"
const cartsSchema = new mongoose.Schema(
    {
        products: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: productsModel },
            quantity: { type:Number, required: true},
            productPriceTotal: { type:Number, required: true},
        }],
        totalPrice: { type:Number, required: true},
        id: { type:Number, required: true},
    },
    {
        timestamps: true
    }
)

export const cartsModel = mongoose.model(cartsColl, cartsSchema)
