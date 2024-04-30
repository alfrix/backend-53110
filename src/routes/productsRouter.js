import { Router } from "express"
import productsController from '../controllers/productsController.js';

const router = Router()


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


router.get('/', productsController.getProducts)
router.get("/:pid", productsController.getProductById)

router.post("/", productsController.addProduct)

router.put("/:pid", productsController.updateProduct)

router.delete("/:pid", productsController.deleteProduct)


export { router }