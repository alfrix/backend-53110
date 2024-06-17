import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";


const productsColl = "products"
const productsSchema = new mongoose.Schema(
    {
        title: { type:String, required: true},
        description: { type:String, required: true},
        code: { type:String, required: true, unique: true},
        price: { type:Number, required: true},
        stock: { type:Number, required: true},
        category: { type:String, required: true},
        status: { type:Boolean},
        thumbnails: { type:Array, required: false},
        owner: { type:String, required: false},
    },
    {
        timestamps: true
    }
)
productsSchema.plugin(paginate);
export const productsModel = mongoose.model(productsColl, productsSchema)
