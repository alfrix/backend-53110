import * as path from 'path';
import { __dirname } from './utils.js'
import ProductManager from './ProductManager.js'
import express from 'express'


const file = path.join(path.resolve(__dirname, '..'), "data/products.json");
const pman = new ProductManager(file);
const PORT=8080
const app=express()

app.get("/", (req, res)=>{
    res.send("<center><h1>Server básico con Express</h1></center>")
})

app.get("/products", (req, res) => {
    let {limit} = req.query
    console.log("query:", req.query)
    products = pman.getProducts()
    if (limit && limit > 0) {
        products = products.slice(0, limit)
    }
    return res.send(products)
})

app.get("/products/:id", (req, res) => {
    let {id} = req.params
    id = Number(id)
    if (isNaN(id)) {
        return res.send(`Error: ID debe ser un numero`)
    }
    let product = pman.getProductById(id)
    if (!product) {
        return res.send(`Error: ID ${id} no encontrado`)
    }
    return res.json(product);
})

app.get("*", (req, res) => {
    res.send("<center><h1>404 - Not Found</h1></center>")
})

app.listen(PORT, ()=>{console.log(`Server OK en puerto ${PORT}`)})