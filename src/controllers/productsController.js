
import { productsDAO as pDAO} from "../dao/mongoDB/productsDAO.js"

const productsDAO = new pDAO()

export default class productsController{

    static addProduct=async(req,res)=>{
        let product = req.body
        if (product._id) {
            delete product._id
        }
        console.log("Agregando producto")
        try {
            let response = [];
            const mongores = await productsDAO.create(product)
            if (mongores.insertedId) {
                response.push(await productsDAO.findById(product._id))
            }
            response.push(mongores)
            req.io.emit("newProduct", response)
            return res.status(201).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    /**
     * 
     * @param {Number} req.limit per page
     * @param {Number} req.page
     * @param {Object} req.query { "title": "Sopa" } 
     * @param {String} req.sort "asc" || "desc" (by price)
     * @returns 
     */
    static getProducts=async(req,res)=>{
        let {limit, page, query, sort} = req.query
        if (!query) { 
            query = {}
        } else {
            try {
                console.log(query)
                query = JSON.parse(query)
            } catch (error) {
                console.error(error)
                return res.status(400).json({error: `Unable to parse JSON query ${query}: ${error}`})
            }
        }
        if (!sort || !(["asc", "desc"].includes(sort))) {
            console.log(`sort not valid ${sort}`)
            sort = 'asc'
        }
        (!limit || isNaN(limit) || limit < 1)? limit = 10 : limit = Math.floor(limit);
        (!page || isNaN(page) || page < 1)? page = 1 : page = Math.floor(page);
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
            } = await productsDAO.paginate(query, options)
            const response = {
                status: "success",
                payload: products,
                totalPages: totalPages,
                prevPage: prevPage,
                nextPage: nextPage,
                page: page,
                hasPrevPage: hasPrevPage,
                hasNextPage: hasNextPage
            }
            if (req.views) {
                return response
            }
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static getProductById=async(req,res)=> {
        let {pid} = req.params
        try {
            let product = await productsDAO.findById(pid);
            if (!product) {
                return res.status(404).json({error: `No encontrado ${pid}`})
            }
            return res.status(200).json(product)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static updateProduct=async(req,res)=> {
        let {pid} = req.params
        let product = req.body
        if (product._id) {
            delete product._id
        }
        try {
            const oldProduct = await productsDAO.findById(pid);
            if (!oldProduct || !product) {
                let msg = `No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`;
                console.error(msg);
                return res.status(400).json({error: msg})
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
        console.log(`Actualizando producto id: ${pid}`);
        try {
            let response = [];
            const mongores = await productsDAO.updateOne(pid, product)
            response.push(await productsDAO.findById(pid))
            response.push(mongores)
            req.io.emit("updateProduct", response)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static deleteProduct=async(req,res)=> {
        let {pid} = req.params
        console.log(`Borrando id: ${pid}`)
        try {
            let response = [];
            response.push(await productsDAO.findById(pid))
            response.push(await productsDAO.deleteOne(pid))
            req.io.emit("deleteProduct", response)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }
}