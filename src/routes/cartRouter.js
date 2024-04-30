import { Router } from "express"
import cartsController from '../controllers/cartsController.js';

const router = Router()

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

router.get("/:cid", cartsController.getCartById)

router.post("/", cartsController.addCart)
router.post('/:cid/product/:pid', cartsController.addProduct)

router.delete('/:cid/product/:pid', cartsController.removeProductfromCart)
router.delete('/:cid', cartsController.emptyCart)

router.put('/:cid', cartsController.updateCart)
router.put('/:cid/product/:pid', cartsController.updateCartProduct)

export { router }