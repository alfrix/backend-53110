import { Router } from "express";
import productsController from "../controllers/productsController.js";
import { auth } from "../middlewares/auth.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use((req, res, next) => {
  req.logger.debug("Acceso a products");
  next()
});

router.use(setJsonResponse);

router.get("/", auth(["public"]), async (req, res, next) => {
  const products = await productsController.getProducts(req, res, next);
  return res.status(200).json(products);
});

router.get("/:pid", auth(["public"]), async (req, res, next) => {
  const product = await productsController.getProductById(req, res, next);
  return res.status(200).json(product);
});

router.post("/", auth(["admin", "premium"]), upload.array('thumbnails', 2), async (req, res, next) => {
  const product = await productsController.addProduct(req, res, next);
  return res.status(201).json(product);
});

router.put("/:pid", auth(["admin", "premium"]), upload.array('thumbnails', 2), async (req, res, next) => {
  const product = await productsController.updateProduct(req, res, next);
  return res.status(200).json(product);
});

router.delete("/:pid", auth(["admin", "premium"]), async (req, res, next) => {
  const product = await productsController.deleteProduct(req, res, next);
  return res.status(200).json(product);
});

export { router };
