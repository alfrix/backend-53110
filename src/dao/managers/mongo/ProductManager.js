import { productsModel } from "../../models/products.model.js";

class ProductManager {

    async addProduct(product) {
        if (product._id) {
            delete product._id
        }
        console.log("Agregando producto")
        try {
            let response = [];
            const mongores = await productsModel.create(product)
            if (mongores.insertedId) {
                response.push(await this.getProductById(product._id))
            }
            response.push(mongores)
            return {status: 201, json: {...response}}
        } catch (error) {
            return {status: 500, json: {error}}
        }
    }

    async getProducts(limit, page, query, sort) {
        // return await productsModel.find().lean()
        if (!query) { 
            query = {}
        } else {
            try {
                query = JSON.parse(query)
            } catch (error) {
                return {
                    "status": "error",
                    "error": `Unable to parse JSON query ${query}: ${error}`
                }
            }
        }
        if (!sort || !(["asc", "desc"].includes(sort))) {
            console.log(`sort not valid ${sort}`)
            sort = 'asc'
        }
        (!limit || isNaN(limit) || limit < 1)? limit = 10 : limit = Math.floor(limit);
        (!page || isNaN(page) || page < 1)? page = 1 : page = Math.floor(page);
        console.log(`limit ${limit} page ${page} query ${JSON.stringify(query)} sort ${JSON.stringify(sort)}`)
        try {
            let options = {
                page: page,
                limit:limit,
                lean: true,
                sort: { price: sort }
            }

            let {
                docs:products,
                totalPages,
                prevPage, nextPage,
                hasPrevPage, hasNextPage
            } = await productsModel.paginate(query, options)
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
        try {
            return await productsModel.findById(pid).lean()
        } catch (error) {
            return {status: 500, json: {error}}
        }
    }

    async updateProduct(pid, product) {
        if (product._id) {
            delete product._id
        }
        try {
            const oldProduct = await this.getProductById(pid);
            if (!oldProduct || !product) {
                let msg = `No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`;
                console.error(msg);
                return {status: 400, json: {error: msg}}
            }
        } catch (error) {
            return {status: 500, json: {error}}
        }
        console.log(`Actualizando producto id: ${pid}`);
        try {
            let response = [];
            const mongores = await productsModel.updateOne({_id: pid}, product)
            response.push(await this.getProductById(pid))
            response.push(mongores)
            return {status: 200, json: {...response}}
        } catch (error) {
            return {status: 500, json: {error}}
        }
    }

    async deleteProduct(pid) {
        console.log(`Borrando id: ${pid}`)
        try {
            let response = [];
            response.push(await this.getProductById(pid))
            response.push(await productsModel.deleteOne({_id: pid}))
            return {status: 200, json: {...response}}
        } catch (error) {
            return {status: 500, json: error}
        }
    }
}

export default ProductManager
