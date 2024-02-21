import * as path from 'path';
import { __dirname } from './utils.js'
import ProductManager from './ProductManager.js'
import express from 'express'


const file = path.join(path.resolve(__dirname, '..'), "data/products.json");
const pman = new ProductManager(file);
const PORT=8080
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

function validarId(id) {
    id = Number(id)
    if (isNaN(id)) {
        return {status: 400, json: [{error: 'ID debe ser un numero'}]}
    }
    let product = pman.getProductById(id)
    if (!product) {
        return {status: 404, json: [{error: `ID ${id} no encontrado`}]}
    }
    return {status: 200, json: product}
}

app.get("/", (req, res)=>{
    res.send("<center><h1>Server básico con Express</h1></center>")
})

app.get("/products", (req, res) => {
    let {limit} = req.query
    console.log("query:", req.query)
    let products = pman.getProducts()
    console.log(products)
    if (limit && limit > 0) {
        products = products.slice(0, limit)
    }
    return res.json(products)
})

app.get("/products/:id", (req, res) => {
    let {id} = req.params
    let response = validarId(id)
    return res.status(response.status).json(response.json)
})

app.get("*", (req, res) => {
    res.status(404).send("<center><h1>404 - Not Found</h1></center>")
})

app.post("/products", (req, res) => {
    console.log(req.body)
    let response = pman.addProduct(req.body)
    return res.status(response.status).json(response.json)
})

app.put("/products/:id", (req, res) => {
    let {id} = req.params
    console.log(req.body)
    let response = validarId(id)
    if (response.status == 200) {
        response = pman.updateProduct(Number(id), req.body)
    }
    return res.status(response.status).json(response.json)
})

app.delete("/products/:id", (req, res) => {
    let {id} = req.params
    let response = validarId(id)
    if (response.status == 200) {
        response = pman.deleteProduct(Number(id))
    }
    return res.status(response.status).json(response.json)

})

app.listen(PORT, ()=>{console.log(`Server OK en puerto ${PORT}`)})