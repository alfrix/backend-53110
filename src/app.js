import express from 'express'
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from "node:path";
import { __dirname } from './utils.js';
import { router as productsRouter } from './routes/productsRouter.js';
import { router as cartRouter } from './routes/cartRouter.js';
import { router as viewsRouter } from './routes/viewsRouter.js';

const PORT=8080
const app=express()
const server = app.listen(PORT, ()=>{console.log(`Server OK en puerto ${PORT}`)})
const io = new Server(server)

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '/public')))

app.use("/api/products", (req, res, next) => {
    req.io = io
    next()
}, productsRouter)
app.use("/api/carts", cartRouter)
app.use("/", (req, res, next) => {
    req.io = io
    next()
}, viewsRouter)

app.use((error, req, res, next) => {
    if(error) {
        console.log(`error: ${error}`)
    }
    next()
})