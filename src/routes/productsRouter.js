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
  const product = await productsController.getProductById(req, res, next);
  return res.status(200).json(product);
});

router.post("/", async (req, res, next) => {
  const product = await productsController.addProduct(req, res, next);
  return res.status(201).json(product);
});

router.put("/:pid", async (req, res, next) => {
  const product = await productsController.updateProduct(req, res, next);
  return res.status(200).json(product);
});

router.delete("/:pid", async (req, res, next) => {
  const product = await productsController.deleteProduct(req, res, next);
  return res.status(200).json(product);
});

export { router };
