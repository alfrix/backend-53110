import { Router } from "express"
import { __dirname, rutaproducts, validarId } from '../utils.js'
import ProductManager from '../dao/ProductManagerDB.js'

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

router.get("/", async(req, res) => {
    let {limit, page} = req.query
    let products = await pman.getProducts(limit, page);
    console.log(products)
    return res.json(products)
})

router.get("/:pid", async(req, res) => {
    let {pid} = req.params
    let response = validarId(pid, await pman.getProductById(Number(pid)))
    return res.status(response.status).json(response.json)
})

router.post("/", async(req, res) => {
    let response = await pman.addProduct(req.body)
    req.io.emit("newProduct", response.json)
    return res.status(response.status).json(response.json)
})

router.put("/:pid", async(req, res) => {
    let {pid} = req.params
    const product = await pman.getProductById(Number(pid))
    let response = validarId(pid, product)
    if (response.status == 200) {
        response = await pman.updateProduct(Number(pid), req.body)
        req.io.emit("updateProduct", response.json)
    }
    console.log(response)
    return res.status(response.status).json(response.json)
})

router.delete("/:pid", async(req, res) => {
    let {pid} = req.params
    let response = validarId(pid, await pman.getProductById(Number(pid)))
    if (response.status == 200) {
        response = await pman.deleteProduct(Number(pid))
        req.io.emit("deleteProduct", response.json)
    }
    return res.status(response.status).json(response.json)

})

export { router }