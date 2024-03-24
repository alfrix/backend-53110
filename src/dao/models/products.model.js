import mongoose from "mongoose";

const productsColl = "products"
const productsSchema = new mongoose.Schema(
    {
        title: { type:String, required: true},
        description: { type:String, required: true},
        code: { type:String, required: true},
        price: { type:Number, required: true},
        stock: { type:Number, required: true},
        category: { type:String, required: true},
        status: { type:Boolean, required: true},
        thumbnails: { type:Array, required: false},
        id: { type:Number, required: true},
    },
    {
        timestamps: true
    }
)

export const productsModel = mongoose.model(productsColl, productsSchema)
