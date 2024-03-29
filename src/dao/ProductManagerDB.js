import { isObject } from "node:util";
import { productsModel } from "./models/products.model.js";

class ProductManager {

    async addProduct(product) {
        if (product._id) {
            delete product._id
        }
        console.log("Agregando producto")
        let response = [{error:''}];
        try {
            const mongores = await productsModel.create(product)
            if (mongores.insertedId) {
                response.push(await this.getProductById(product._id))
            }
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 201, json: response}
    }

    async getProducts(limit, page, query, sort) {
        // return await productsModel.find().lean()
        if (!query) { query = {} }
        (!limit || isNaN(limit) || limit < 1)? limit = 10 : limit = Math.floor(limit);
        (!page || isNaN(page) || page < 1)? page = 1 : page = Math.floor(page);
        console.log(`limit ${limit} page ${page} query ${JSON.stringify(query)}`)
        try {
            let {
                docs:products,
                totalPages,
                prevPage, nextPage,
                hasPrevPage, hasNextPage
            } = await productsModel.paginate({}, {page: page, limit:limit, lean:true})
            return {
                status: "success",
                payload: products,
                totalPages: totalPages,
                prevPage: prevPage,
                nextPage: nextPage,
                page: page,
                hasPrevPage: hasPrevPage,
                hasNextPage: hasNextPage
            }
        } catch (error) {
            return {
                status: "error",
                error: error
            }
        }
    }

    async getProductById(pid) {
        let p = await productsModel.findOne({_id: pid}).lean()
        console.log("getProductById", p)
        return p
    }

    async updateProduct(pid, product) {
        if (product._id) {
            delete product._id
        }
        const oldProduct = await this.getProductById(pid);
        if (!oldProduct || !product) {
          let msg = `No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`;
          console.error(msg);
          return {status: 400, json: [{error: msg}]}
        }
        let msg = `Actualizando producto id: ${pid}`;
        console.error(msg);
        let response = [{error:''}];
        try {
            const mongores = await productsModel.updateOne({_id: pid}, product)
            response.push(await this.getProductById(pid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }

    async deleteProduct(pid) {
        let msg = `Borrando id: ${pid}`;
        console.log(msg)
        let response = [{error:''}];
        try {
            response.push(await this.getProductById(pid))
            response.push(await productsModel.deleteOne({_id: pid}))
        } catch (error) {
            return {status: 500, json: error}
        }
        return {status: 200, json: response}
    }
}

export default ProductManager
