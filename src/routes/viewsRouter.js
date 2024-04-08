import { Router } from "express";
import ProductManager from "../dao/ProductManagerDB.js";
import CartManager from '../dao/CartManagerDB.js'
import { auth } from "../middlewares/auth.js";

const router = Router();
const pman = new ProductManager();
const cman = new CartManager();
let cartItemCount = 0
let user;

router.use(async(req, res, next) => {
  let timestamp = new Date().toUTCString();
  console.log(`Acceso a views: ${timestamp}`);
  cartItemCount = 0;
  if (req.session.user) {
    user = {...req.session.user}
    delete user.password
  } else {
    user = undefined
  }
  try {
    let cart = await cman.getCartById(1);
    cart.products.forEach((product) => {cartItemCount += product.quantity});
  } catch (error) {
    res.status(500).render(("500"), {error})
    return
  }

  next();
});

router.get("/realTimeProducts", async (req, res) => {
  let pageTitle = "realTimeProducts";
  res.status(200).render("realTimeProducts", {
    pageTitle,
    cartItemCount,
    user,
  });
});

router.get("/", async (req, res) => {
  let {limit, page, query, sort} = req.query
  let products;
  try {
    products = await pman.getProducts(limit, page, query, sort);
    if (products.status == "error") {
      throw products.error
    }
  } catch (error) {
    res.status(500).render(("500"), {error})
    return
  }
  let pageTitle = "Home";
  res.status(200).render("home", {
    pageTitle,
    cartItemCount,
    products,
    user,
  });
});

router.get("/chat", (req, res) => {
  let pageTitle = "Chat";
  res.status(200).render("chat", {
    pageTitle,
    cartItemCount,
    user,
  });
});

router.get("/cart/:cid", async(req, res) => {
  let {cid} = req.params
  let cart = await cman.getCartById(cid);
  let pageTitle = "Carrito";
  res.status(200).render("cart", {
    pageTitle,
    cartItemCount,
    cart,
    user,
  });
});

router.get("/login", async(req, res) => {
  let { email } = req.query
  if (user) {
    return res.redirect('/')
  }
  let pageTitle = "Login"
  res.status(200).render("login", {
    pageTitle,
    cartItemCount,
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
    cartItemCount,
    user,
  })
})

router.get("/profile", auth, async(req, res) => {
  let pageTitle = "Perfil"
  res.status(200).render("profile", {
    pageTitle,
    cartItemCount,
    user,
  })
})

router.get("*", (req, res) => {
  let pageTitle = "404";
  res.status(404).render("404", {
    pageTitle,
    user,
  });
});

export { router };
