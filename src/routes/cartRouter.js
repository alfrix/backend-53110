import { Router } from "express";
import cartsController from "../controllers/cartsController.js";
import { auth } from "../middlewares/auth.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";

const router = Router();

router.use((req, res, next) => {
  req.logger.debug("Acceso a carts");
  next()
});

router.use(setJsonResponse);

router.get("/:cid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.getCartById(req, res, next);
  return res.status(200).json(cart);
});

router.post("/", auth(["public"]), async (req, res, next) => {
  const cart = await cartsController.addCart(req, res, next);
  return res.status(201).json(cart);
});

router.post("/:cid/product/:pid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.addProduct(req, res, next);
  return res.status(201).json(cart);
});

router.delete("/:cid/product/:pid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.removeProductfromCart(req, res, next);
  return res.status(200).json(cart);
});

router.delete("/:cid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.deleteCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.updateCart(req, res, next);
  return res.status(200).json(cart);
});

router.put("/:cid/product/:pid", auth(["user", "premium"]), async (req, res, next) => {
  const cart = await cartsController.updateCartProduct(req, res, next);
  return res.status(200).json(cart);
});

router.get("/:cid/purchase", auth(["user", "premium"]), async (req, res, next) => {
  const ticket = await cartsController.purchase(req, res, next);
  return res.status(200).json(ticket);
});

router.post('/:cid/pay', auth(["user", "premium"]), async (req, res) => {
  const response = await cartsController.pay(req, res)
  return res.status(200).json(response);
})

router.get('/feedback', function (req, res) {
  return res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id
  });
});

export { router };
