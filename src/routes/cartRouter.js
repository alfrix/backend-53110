import { Router } from "express"
import { __dirname, rutacarts, validarId } from '../utils.js'
import CartManager from '../dao/CartManagerFS.js'

const router = Router()
const cman = new CartManager(rutacarts);

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
    let response = validarId(cid, cman.getCartById(Number(cid)))
    return res.status(response.status).json(response.json)
})

router.post("/:cid/product/:pid", (req, res) => {
    let {cid, pid} = req.params
    let response = cman.addProduct(cid, pid)
    return res.status(response.status).json(response.json)
})

export { router }