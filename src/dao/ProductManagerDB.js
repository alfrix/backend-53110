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

    async getProducts() {
        return await productsModel.find().lean()
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
