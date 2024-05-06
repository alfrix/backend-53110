import { Router } from "express";
import productsController from '../controllers/productsController.js';
import cartsController from '../controllers/cartsController.js';

import { auth } from "../middlewares/auth.js";
import { log } from "../middlewares/log.js";

const router = Router();

router.use(log("Acceso a views"))
router.use(async(req, res, next) => {
  req.views = true;  // para que el controller devuelva un objeto y no una respuesta
  let cartItemCount = 0;
  let user = req.session.user;

  if (user && user.cart) {
    try {
      req.params.cid = user.cart;
      const cart = await cartsController.getCartById(req, res);
      cartItemCount = cart.products.reduce((total, product) => total + product.quantity, 0);
    } catch (error) {
      res.status(500).render("500", { error });
      return;
    }
  }
  res.locals.cartItemCount = cartItemCount;
  res.locals.user = user;
  next();
});


router.get("/realTimeProducts", async (req, res) => {
  let pageTitle = "realTimeProducts";
  res.status(200).render("realTimeProducts", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: res.locals.user,
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
    return res.status(500).render(("500"), {error})
  }
  let pageTitle = "Home";
  res.status(200).render("home", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    products,
    user: res.locals.user,
  });
});

router.get("/chat", (req, res) => {
  let pageTitle = "Chat";
  res.status(200).render("chat", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: res.locals.user,
  });
});

router.get("/cart/:cid", async(req, res) => {
  let cart;
  try {
    cart = await cartsController.getCartById(req, res);
  } catch (error) {
    let pageTitle = "500";
    res.status(500).render("500", {
      pageTitle,
      user: res.locals.user,
    });
  }
  let pageTitle = "Carrito";
  res.status(200).render("cart", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    cart,
    user: res.locals.user,
  });
});

router.get("/login", async(req, res) => {
  let { email } = req.query
  if (res.locals.user) {
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
    user: res.locals.user,
  })
})

router.get("/profile", auth, async(req, res) => {
  let pageTitle = "Perfil"
  res.status(200).render("profile", {
    pageTitle,
    cartItemCount: res.locals.cartItemCount,
    user: res.locals.user,
  })
})

router.get("*", (req, res) => {
  let pageTitle = "404";
  res.status(404).render("404", {
    pageTitle,
    user: res.locals.user,
  });
});

export { router };
