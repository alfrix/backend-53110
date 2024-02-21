import { Router } from "express"
import * as path from 'path';
import { __dirname } from '../utils.js'
import ProductManager from '../managers/ProductManager.js'

const router = Router()
const file = path.join(path.resolve(__dirname, '..'), "data/products.json");
const pman = new ProductManager(file);

function validarId(id) {
    id = Number(id)
    if (isNaN(id)) {
        return {status: 400, json: [{error: 'ID debe ser un numero'}]}
    }
    let product = pman.getProductById(id)
    if (!product) {
        return {status: 404, json: [{error: `ID ${id} no encontrado`}]}
    }
    return {status: 200, json: product}
}

router.use((req, res, next) => {
    let timestamp = new Date().toUTCString();
    console.log(`Acceso a products: ${timestamp}`)
    next()
  })

router.get("/", (req, res) => {
    let {limit} = req.query
    console.log("query:", req.query)
    let products = pman.getProducts()
    console.log(products)
    if (limit && limit > 0) {
        products = products.slice(0, limit)
    }
    return res.json(products)
})

router.get("/:id", (req, res) => {
    let {id} = req.params
    let response = validarId(id)
    return res.status(response.status).json(response.json)
})

router.post("/", (req, res) => {
    console.log(req.body)
    let response = pman.addProduct(req.body)
    return res.status(response.status).json(response.json)
})

router.put("/:id", (req, res) => {
    let {id} = req.params
    console.log(req.body)
    let response = validarId(id)
    if (response.status == 200) {
        response = pman.updateProduct(Number(id), req.body)
    }
    return res.status(response.status).json(response.json)
})

router.delete("/:id", (req, res) => {
    let {id} = req.params
    let response = validarId(id)
    if (response.status == 200) {
        response = pman.deleteProduct(Number(id))
    }
    return res.status(response.status).json(response.json)

})

export { router }