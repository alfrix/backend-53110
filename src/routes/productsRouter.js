import { Router } from "express"
import { __dirname, rutaproducts } from '../utils.js'
import ProductManager from '../managers/ProductManager.js'

const router = Router()
const pman = new ProductManager(rutaproducts);

function validarId(id) {
    id = Number(id)
    if (isNaN(id)) {
        return {status: 400, json: [{error: `ID debe ser un numero, ingreso: ${id}`}]}
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
    if (req.query) {
        console.log(`products query: ${JSON.stringify(req.query)}`)
    }
    if (req.body) {
        console.log(`products body: ${JSON.stringify(req.body)}`)
    }
    next()
  })

router.get("/", (req, res) => {
    let {limit} = req.query
    let products = pman.getProducts()
    if (limit && limit > 0) {
        products = products.slice(0, limit)
    }
    return res.json(products)
})

router.get("/:pid", (req, res) => {
    let {pid} = req.params
    let response = validarId(pid)
    return res.status(response.status).json(response.json)
})

router.post("/", (req, res) => {
    let response = pman.addProduct(req.body)
    return res.status(response.status).json(response.json)
})

router.put("/:pid", (req, res) => {
    let {pid} = req.params
    let response = validarId(pid)
    if (response.status == 200) {
        response = pman.updateProduct(Number(pid), req.body)
    }
    return res.status(response.status).json(response.json)
})

router.delete("/:pid", (req, res) => {
    let {pid} = req.params
    let response = validarId(pid)
    if (response.status == 200) {
        response = pman.deleteProduct(Number(pid))
    }
    return res.status(response.status).json(response.json)

})

export { router }