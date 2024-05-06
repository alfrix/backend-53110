import { Router } from "express"
import cartsController from '../controllers/cartsController.js';
import { log } from "../middlewares/log.js";

const router = Router()

router.use(log("Acceso a carts"))


router.get("/:cid", cartsController.getCartById)

router.post("/", cartsController.addCart)
router.post('/:cid/product/:pid', cartsController.addProduct)

router.delete('/:cid/product/:pid', cartsController.removeProductfromCart)
router.delete('/:cid', cartsController.emptyCart)

router.put('/:cid', cartsController.updateCart)
router.put('/:cid/product/:pid', cartsController.updateCartProduct)

export { router }