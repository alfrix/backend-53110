import express from 'express'
import { router as productsRouter } from './routes/productsRouter.js';

const PORT=8080
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/products", productsRouter)

app.get("/", (req, res)=>{
    res.send("<center><h1>Server básico con Express</h1></center>")
})


app.get("*", (req, res) => {
    res.status(404).send("<center><h1>404 - Not Found</h1></center>")
})

app.listen(PORT, ()=>{console.log(`Server OK en puerto ${PORT}`)})