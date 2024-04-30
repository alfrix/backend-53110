import { productsModel } from "../models/products.model.js";

export class productsDAO{

    async getProductById(pid) {
        return await productsModel.findById(pid).lean()
    }

    async create(product){
        return await productsModel.create(product)
    }

    async updateOne(pid, product) {
        return await productsModel.updateOne({_id: pid}, product) 
    }

    async deleteOne(pid) {
        return await productsModel.deleteOne({_id: pid}) 
    }

    async paginate(query, options) {
        return await productsModel.paginate(query, options)
    }

    async findById(pid) {
        return await productsModel.findById(pid).lean()
    }
}