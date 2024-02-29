import { Router } from "express"
import { __dirname, rutacarts } from '../utils.js'
import CartManager from '../managers/CartManager.js'

const router = Router()
const cman = new CartManager(rutacarts);

function validarId(id) {
    id = Number(id)
    if (isNaN(id)) {
        return {status: 400, json: [{error: 'ID debe ser un numero'}]}
    }
    let cart = cman.getCartById(id)
    if (!cart) {
        return {status: 404, json: [{error: `ID ${id} no encontrado`}]}
    }
    return {status: 200, json: cart}
}

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


router.post("/", (req, res) => {
    let response = cman.addCart()
    return res.status(response.status).json(response.json)
})

router.get("/:cid", (req, res) => {
    let {cid} = req.params
    let response = validarId(cid)
    return res.status(response.status).json(response.json)
})

router.post("/:cid/product/:pid", (req, res) => {
    let {cid, pid} = req.params
    let response = cman.addProduct(cid, pid)
    return res.status(response.status).json(response.json)
})

export { router }