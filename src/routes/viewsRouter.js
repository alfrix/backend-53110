import { Router } from "express";
import { rutaproducts } from "../utils.js";
import ProductManager from "../dao/ProductManagerDB.js";
import { transcode } from "node:buffer";

const router = Router();
const pman = new ProductManager();

router.use((req, res, next) => {
  let timestamp = new Date().toUTCString();
  console.log(`Acceso a views: ${timestamp}`);
  next();
});

router.get("/realTimeProducts", async (req, res) => {
  let pageTitle = "realTimeProducts";
  res.status(200).render("realTimeProducts", {
    pageTitle
  });
});

router.get("/", async (req, res) => {
  let {limit, page} = req.query
  let products;
  try {
    products = await pman.getProducts(limit, page);
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
    products,
  });
});

router.get("/chat", (req, res) => {
  res.status(200).render("chat");
});

router.get("/cart/:cid", (req, res) => {
  // TODO: listar productos
});

router.get("*", (req, res) => {
  let pageTitle = "404";
  res.status(404).render("404", {
    pageTitle,
  });
});

export { router };
