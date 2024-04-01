import { Router } from "express";
import { rutaproducts } from "../utils.js";
import ProductManager from "../dao/ProductManagerDB.js";
import CartManager from '../dao/CartManagerDB.js'

const router = Router();
const pman = new ProductManager();
const cman = new CartManager();
let cartItemCount = 0

router.use(async(req, res, next) => {
  let timestamp = new Date().toUTCString();
  console.log(`Acceso a views: ${timestamp}`);
  cartItemCount = 0;
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
  });
});

router.get("/chat", (req, res) => {
  res.status(200).render("chat");
});

router.get("/cart/:cid", async(req, res) => {
  let {cid} = req.params
  let cart = await cman.getCartById(cid);
  let pageTitle = "Carrito";
  res.status(200).render("cart", {
    pageTitle,
    cartItemCount,
    cart,
  });
});

router.get("*", (req, res) => {
  let pageTitle = "404";
  res.status(404).render("404", {
    pageTitle,
  });
});

export { router };
