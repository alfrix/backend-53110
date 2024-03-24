import { productsModel } from "./models/products.model.js";

class ProductManager {

    async addProduct(product) {
        if (product._id) {
            delete product._id
        }
        product.id = await productsModel.countDocuments()
        product.id += 1
        let msg = `Agregando id: ${product.id}`
        console.log(msg)
        let response = [{error:''}];
        try {
            const mongores = await productsModel.create(product)
            response.push(await this.getProductById(product.id))
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
        let p = await productsModel.findOne({id: pid}).lean()
        console.log("getProductById", p)
        return p
    }

    async updateProduct(pid, product) {
        if (product._id) {
            delete product._id
        }
        if (product.id) {
            delete product.id
        }
        const oldProduct = await this.getProductById(pid);
        if (!oldProduct || !product || product.id) {
          let msg = `No se puede actualizar id: ${pid} datos: ${oldProduct} ${product} ${product.id}`;
          console.error(msg);
          return {status: 400, json: [{error: msg}]}
        }
        let msg = `Actualizando producto id: ${pid}`;
        console.error(msg);
        let response = [{error:''}];
        try {
            const mongores = await productsModel.updateOne({id: pid}, product)
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
            response.push(await productsModel.deleteOne({id: pid}))
        } catch (error) {
            return {status: 500, json: error}
        }
        return {status: 200, json: response}
    }
}

export default ProductManager
