import { Router } from "express";
import productsController from '../controllers/productsController.js';
import cartsController from '../controllers/cartsController.js';

import { auth } from "../middlewares/auth.js";
import { log } from "../middlewares/log.js";

const router = Router();

router.use(log("Acceso a views"))
router.use(async(req, res, next) => {
  req.views = true;  // para que el controller devuelva un objeto y no una respuesta
  res.locals.cartItemCount = await cartsController.getCartItemCount(req, res);
  next();
});


router.get("/realTimeProducts", async (req, res) => {
  let pageTitle = "realTimeProducts";
  res.status(200).render("realTimeProducts", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("/", async (req, res) => {
  let products;
  try {
    products = await productsController.getProducts(req, res);
    if (products.status == "error") {
      throw products.error
    }
  } catch (error) {
    console.error("views /", error)
    const status = 500
    let pageTitle = status
    res.status(status).render("error", {
      pageTitle,
      user: req.session.user,
      status: status,
      message: error
    });
  }
  let pageTitle = "Home";
  res.status(200).render("home", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    products,
    user: req.session.user,
  });
});

router.get("/chat", (req, res) => {
  let pageTitle = "Chat";
  res.status(200).render("chat", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  });
});

router.get("/cart/:cid", async(req, res) => {
  let cart;
  try {
    cart = await cartsController.getCartById(req, res);
  } catch (error) {
    const status = 500
    let pageTitle = status
    res.status(status).render("error", {
      pageTitle,
      user: req.session.user,
      status: status,
      message: error
    });
  }
  let pageTitle = "Carrito";
  res.status(200).render("cart", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    cart,
    user: req.session.user,
  });
});

router.get("/login", async(req, res) => {
  let { email } = req.query
  if (req.session.user) {
    return res.redirect('/')
  }
  let pageTitle = "Login"
  res.status(200).render("login", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    email,
  })
})

router.get("/signup", async(req, res) => {
  if (user) {
    return res.redirect('/')
  }
  let pageTitle = "Sign-Up"
  res.status(200).render("signup", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  })
})

router.get("/profile", auth, async(req, res) => {
  let pageTitle = "Perfil"
  res.status(200).render("profile", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: req.session.user,
  })
})

router.get("*", (req, res) => {
  const status = 404
  let pageTitle = status
  res.status(status).render("error", {
    pageTitle,
    user: req.session.user,
    status: status,
    message: "Not Found"
  });
});

export { router };
