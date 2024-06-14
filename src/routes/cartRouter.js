import { Router } from "express";
import cartsController from "../controllers/cartsController.js";
import { auth } from "../middlewares/auth.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";

const router = Router();

router.use((req, res) => {
  req.logger.debug("Acceso a carts");
});

router.use(setJsonResponse);

router.get("/:cid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.getCartById(req, res, next);
  return res.status(200).json(cart);
});

router.post("/", auth(["public"]), async (req, res, next) => {
  const cart = await cartsController.addCart(req, res, next);
  return res.status(200).json(cart);
});

router.post("/:cid/product/:pid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.addProduct(req, res, next);
  return res.status(201).json(cart);
});

router.delete("/:cid/product/:pid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.removeProductfromCart(req, res, next);
  return res.status(200).json(cart);
});

router.delete("/:cid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.emptyCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.updateCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid/product/:pid", auth(["user"]), async (req, res, next) => {
  const cart = await cartsController.updateCartProduct(req, res, next);
  return res.status(200).json(cart);
});

router.get("/:cid/purchase", auth(["user"]), async (req, res, next) => {
  const ticket = await cartsController.purchase(req, res, next);
  return res.status(200).json(ticket);
});

export { router };
