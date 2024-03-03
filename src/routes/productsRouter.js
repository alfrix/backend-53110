import { Router } from "express"
import { __dirname, rutaproducts, validarId } from '../utils.js'
import ProductManager from '../managers/ProductManager.js'

const router = Router()
const pman = new ProductManager(rutaproducts);


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
    let response = validarId(pid, pman.getProductById(Number(pid)))
    return res.status(response.status).json(response.json)
})

router.post("/", (req, res) => {
    let response = pman.addProduct(req.body)
    req.io.emit("newProduct", response.json)
    return res.status(response.status).json(response.json)
})

router.put("/:pid", (req, res) => {
    let {pid} = req.params
    let response = validarId(pid, pman.getProductById(Number(pid)))
    if (response.status == 200) {
        response = pman.updateProduct(Number(pid), req.body)
        req.io.emit("updateProduct", response.json)
    }
    return res.status(response.status).json(response.json)
})

router.delete("/:pid", (req, res) => {
    let {pid} = req.params
    let response = validarId(pid, pman.getProductById(Number(pid)))
    if (response.status == 200) {
        response = pman.deleteProduct(Number(pid))
        req.io.emit("deleteProduct", response.json)
    }
    return res.status(response.status).json(response.json)

})

export { router }