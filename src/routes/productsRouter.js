import { Router } from "express"
import productsController from '../controllers/productsController.js';
import { log } from "../middlewares/log.js";

const router = Router()

router.use(log("Acceso a products"))


router.get('/', productsController.getProducts)
router.get("/:pid", productsController.getProductById)

router.post("/", productsController.addProduct)

router.put("/:pid", productsController.updateProduct)

router.delete("/:pid", productsController.deleteProduct)


export { router }