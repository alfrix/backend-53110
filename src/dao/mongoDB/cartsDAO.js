import { cartsModel } from "../models/carts.model.js";

export class cartsDAO {
    /**
     * [create a new cart]
     * @param {Array} products 
     * @param {Number} totalPrice 
     * @returns {Object}
     */
    async create(products=[], totalPrice=0) {
        return await cartsModel.create({products, totalPrice})
    }

    /**
     * [Updates one cart with the provided info]
     * @param {String} cid ObjectID
     * @param {Array} products 
     * @param {Number} totalPrice 
     * @returns {Object}
     */
    async updateOne(cid, {products=[], totalPrice=0}){
        return await cartsModel.updateOne({_id: cid}, {products, totalPrice})
    }

    /**
     * [find and returns cart with id]
     * @param {String} cid ObjectID
     * @returns {Object}
     */
    async findById(cid){
        return await cartsModel.findById(cid).lean().populate("products.product")
    }
}