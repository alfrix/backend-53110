import { Router } from "express";
import productsController from "../controllers/productsController.js";
import cartsController from "../controllers/cartsController.js";

import { auth } from "../middlewares/auth.js";
import { log } from "../middlewares/log.js";

const router = Router();

router.use(log("Acceso a views"));
router.use(async (req, res, next) => {
  res.locals.cartItemCount = await cartsController.getCartItemCount(
    req,
    res,
    next
  );
  next();
});

router.get("/realTimeProducts", auth(["public"]), async (req, res, next) => {
  let pageTitle = "realTimeProducts";
  res.status(200).render("realTimeProducts", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("/", auth(["public"]), async (req, res, next) => {
  let products;
  products = await productsController.getProducts(req, res, next);
  let pageTitle = "Home";
  res.status(200).render("home", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    products,
    user: req.session.user,
  });
});

router.get("/chat", auth(["user"]), (req, res, next) => {
  let pageTitle = "Chat";
  res.status(200).render("chat", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("/cart/:cid", auth(["user"]), async (req, res, next) => {
  let cart = await cartsController.getCartById(req, res, next);
  let pageTitle = "Carrito";
  res.status(200).render("cart", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    cart,
    user: req.session.user,
  });
});

router.get("/login", auth(["public"]), async (req, res, next) => {
  let { email } = req.query;
  if (req.session.user) {
    return res.redirect("/");
  }
  let pageTitle = "Login";
  res.status(200).render("login", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    email,
  });
});

router.get("/signup", auth(["public"]), async (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  let pageTitle = "Sign-Up";
  res.status(200).render("signup", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("/profile", auth(["user"]), async (req, res, next) => {
  let pageTitle = "Perfil";
  res.status(200).render("profile", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("*", auth(["public"]), (req, res, next) => {
  const err = new Error(`La página solicitada no existe`);
  err.statusCode = 404;
  next(err);
});

const viewsErrorHandler = (err, req, res, next) => {
  console.error("views /", err);

  const statusCode = err.statusCode || 500;
  let message = "Error interno del servidor";
  switch (statusCode) {
    case 404:
      message = "No encontrado";
      break;
    case 401:
      message = "No autorizado";
      break;
    case 400:
      message = "Petición no valida";
      break;
  }

  let pageTitle = statusCode;
  res.status(statusCode).render("error", {
    pageTitle,
    user: req.session.user,
    status: statusCode,
    message: message,
    error: err,
  });
};

router.use(viewsErrorHandler);

export { router };
