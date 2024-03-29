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
    // populate
    return res.status(response.status).json(response.json)
})

router.post("/:cid/product/:pid", async(req, res) => {
    let {cid, pid} = req.params
    let response = await cman.addProduct(cid, pid)
    return res.status(response.status).json(response.json)
})

// TODO:
router.delete("/:cid/product/:pid"), async(req, res) => {
    // eliminar del carrito elproducto seleccionado.
}

router.delete("/:cid"), async(req, res) => {
    // eliminar todos los productos del carrito
}

router.put("/:cid/product/:pid"), async(req, res) => {
    // actualizar el carrito con un arreglo de productos
}

router.put("/:cid"  ), async(req, res) => {
    // actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada
}
export { router }