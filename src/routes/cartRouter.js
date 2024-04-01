import { Router } from "express"
import { __dirname, validarId } from '../utils.js'
import CartManager from '../dao/CartManagerDB.js'

const router = Router()
const cman = new CartManager();

router.use((req, res, next) => {
    let timestamp = new Date().toUTCString();
    console.log(`Acceso a cart: ${timestamp}`)
    if (req.query) {
        console.log(`cart query: ${JSON.stringify(req.query)}`)
    }
    if (req.body) {
        console.log(`cart body: ${JSON.stringify(req.body)}`)
    }
    next()
  })


router.post("/", async(req, res) => {
    let response = await cman.addCart()
    return res.status(response.status).json(response.json)
})

router.get("/:cid", async(req, res) => {
    let {cid} = req.params
    let response = validarId(cid, await cman.getCartById(Number(cid)))
    return res.status(response.status).json(response.json)
})

router.post("/:cid/product/:pid", async(req, res) => {
    let {cid, pid} = req.params
    let response = await cman.addProduct(cid, pid)
    return res.status(response.status).json(response.json)
})

router.delete("/:cid/product/:pid", async(req, res) => {
    console.log("router delete pid from cart")
    let {cid, pid} = req.params
    let response = await cman.removeProductfromCart(cid, pid)
    return res.status(response.status).json(response.json)
})

router.delete("/:cid", async(req, res) => {
    console.log("router delete cart")
    let {cid} = req.params
    let response = await cman.emptyCart(cid)
    return res.status(response.status).json(response.json)
})

router.put("/:cid/product/:pid", async(req, res) => {
    console.log("update cantidad productos de un cart")
    let {cid, pid} = req.params
    let response = await cman.updateCartProduct(cid, pid, req.body)
    return res.status(response.status).json(response.json)
    // actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada
})

router.put("/:cid", async(req, res) => {
    console.log("update productos de un cart")
    let {cid} = req.params
    let response = await cman.updateCart(cid, req.body)
    return res.status(response.status).json(response.json)
    // actualizar el carrito con un arreglo de productos
})
export { router }