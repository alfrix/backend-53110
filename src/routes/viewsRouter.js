import { Router } from "express";
import productsController from "../controllers/productsController.js";
import cartsController from "../controllers/cartsController.js";

import { auth } from "../middlewares/auth.js";
import { log } from "../middlewares/log.js";
import { viewsErrorHandler } from "../middlewares/viewsErrorHandler.js";

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

router.get(
  "/realTimeProducts",
  log("Views/realProducts"),
  auth(["public"]),
  async (req, res, next) => {
    let pageTitle = "realTimeProducts";
    return res.status(200).render("realTimeProducts", {
      pageTitle,
      cartItemCount: res.locals.cartItemCount,
      user: req.session.user,
    });
  }
);

router.get("/", log("Views/"), auth(["public"]), async (req, res, next) => {
  let products;
  products = await productsController.getProducts(req, res, next);
  let pageTitle = "Home";
  return res.status(200).render("home", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    products,
    user: req.session.user,
  });
});

router.get("/chat", log("Views/chat"), auth(["user"]), (req, res, next) => {
  let pageTitle = "Chat";
  return res.status(200).render("chat", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get(
  "/cart/:cid",
  log("Views/cart"),
  auth(["user"]),
  async (req, res, next) => {
    let cart = await cartsController.getCartById(req, res, next);
    let pageTitle = "Carrito";
    return res.status(200).render("cart", {
      pageTitle,
      cartItemCount: res.locals.cartItemCount,
      cart,
      user: req.session.user,
    });
  }
);

router.get(
  "/login",
  log("Views/login"),
  auth(["public"]),
  async (req, res, next) => {
    let { email } = req.query;
    if (req.session.user) {
      return res.redirect("/");
    }
    let pageTitle = "Login";
    return res.status(200).render("login", {
      pageTitle,
      cartItemCount: res.locals.cartItemCount,
      email,
    });
  }
);

router.get(
  "/signup",
  log("Views/signup"),
  auth(["public"]),
  async (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    }
    let pageTitle = "Sign-Up";
    return res.status(200).render("signup", {
      pageTitle,
      cartItemCount: res.locals.cartItemCount,
      user: req.session.user,
    });
  }
);

router.get(
  "/profile",
  log("Views/profile"),
  auth(["user"]),
  async (req, res, next) => {
    let pageTitle = "Perfil";
    return res.status(200).render("profile", {
      pageTitle,
      cartItemCount: res.locals.cartItemCount,
      user: req.session.user,
    });
  }
);

router.get("*", auth(["public"]), (req, res, next) => {
  const err = new Error(`La página solicitada no existe`);
  err.statusCode = 404;
  next(err);
});

router.use(viewsErrorHandler);

export { router };
