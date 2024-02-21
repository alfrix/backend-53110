import { Router } from "express"
import CartManager from '../managers/CartManager.js'

const router = Router()
const cman = new CartManager();

router.use((req, res, next) => {
    let timestamp = new Date().toUTCString();
    console.log(`Acceso a cart: ${timestamp}`)
    next()
  })

router.get("/", (req, res) => {})
