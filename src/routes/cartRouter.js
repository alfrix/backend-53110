import { Router } from "express";
import cartsController from "../controllers/cartsController.js";
import { log } from "../middlewares/log.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";

const router = Router();

router.use(log("Acceso a carts"));

router.use(setJsonResponse);

router.get("/:cid", async (req, res, next) => {
  const cart = await cartsController.getCartById(req, res, next);
  return res.status(200).json(cart);
});

router.post("/", async (req, res, next) => {
  const cart = await cartsController.addCart(req, res, next);
  return res.status(200).json(cart);
});

router.post("/:cid/product/:pid", async (req, res, next) => {
  const cart = await cartsController.addProduct(req, res, next);
  return res.status(200).json(cart);
});

router.delete("/:cid/product/:pid", async (req, res, next) => {
  const cart = await cartsController.removeProductfromCart(req, res, next);
  return res.status(200).json(cart);
});

router.delete("/:cid", async (req, res, next) => {
  const cart = await cartsController.emptyCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid", async (req, res, next) => {
  const cart = await cartsController.updateCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid/product/:pid", async (req, res, next) => {
  const cart = await cartsController.updateCartProduct(req, res, next);
  return res.status(200).json(cart);
});

export { router };
