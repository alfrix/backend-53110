import { Router } from "express";
import productsController from "../controllers/productsController.js";
import { log } from "../middlewares/log.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";

const router = Router();

router.use(log("Acceso a products"));

router.use(setJsonResponse);

router.get("/", async (req, res, next) => {
  const products = await productsController.getProducts(req, res, next);
  return res.status(200).json(products);
});

router.get("/:pid", async (req, res, next) => {
  const products = await productsController.getProductById(req, res, next);
  return res.status(200).json(products);
});

router.post("/", async (req, res, next) => {
  const products = await productsController.addProduct(req, res, next);
  return res.status(200).json(products);
});

router.put("/:pid", async (req, res, next) => {
  const products = await productsController.updateProduct(req, res, next);
  return res.status(200).json(products);
});

router.delete("/:pid", async (req, res, next) => {
  const products = await productsController.deleteProduct(req, res, next);
  return res.status(200).json(products);
});

export { router };
