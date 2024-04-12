import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from "node:path";
import { __dirname } from './utils.js';
import { router as productsRouter } from './routes/productsRouter.js';
import { router as cartRouter } from './routes/cartRouter.js';
import { router as viewsRouter } from './routes/viewsRouter.js';
import { router as sessionRouter } from './routes/sessionRouter.js';
import mongoose from 'mongoose';
import ProductManager from "./dao/managers/mongo/ProductManager.js";
import MongoStore from 'connect-mongo'
import passport from 'passport';
import { initPassport } from './config/passport.config.js';

const PORT=8080
const app=express()
const server = app.listen(PORT, ()=>{console.log(`Server OK en puerto ${PORT}`)})
const io = new Server(server)
// const mongoURL = "mongodb://127.0.0.1:27017/test"
const mongoUrl = "mongodb+srv://Coder53110:CoderCoder@cluster0.8967ybh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&dbName=ecommerce"

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '/public')))
app.use(session(
    {
        secret: "CoderCoder",
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl, ttl: 60 })
    }
))

initPassport()
app.use(passport.initialize())
app.use(passport.session())

app.use("/api/products", (req, res, next) => {
    req.io = io
    next()
}, productsRouter)

app.use("/api/carts", cartRouter)
app.use("/api/session", sessionRouter)

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

const connectDB=async()=>{
    try{
        await mongoose.connect(mongoUrl)
        console.log("DB Conectada")
    } catch (error) {
        console.log("ERROR al conectar:", error.message)
    }
}

connectDB()

let messages = [];
let users = [];

io.on("connection", (socket) => {
    console.log(`Conectado id: ${socket.id}`);

    socket.on("getProducts", async() => {
        const pman = new ProductManager();
        try {
            const products = await pman.getProducts();
            io.emit('showProducts', products);
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    socket.on("welcome", (name) => {
      users.push({ id: socket.id, name });
      socket.emit("history", messages);
      socket.broadcast.emit("newUser", name);
    });

    socket.on("message", (name, msg) => {
      const timestamp = new Date().toUTCString()
      messages.push({ name, msg, timestamp });
      io.emit("newMessage", name, msg, timestamp);
    });

    socket.on("disconnect", () => {
      console.log(`Desconectado id: ${socket.id}`);
      const user = users.find((u) => u.id === socket.id);
      if (user) {
        const timestamp = new Date().toUTCString()
        socket.broadcast.emit("userDisconnect", user.name, timestamp);
        const index = users.indexOf(user);
        users.splice(index, 1)
      }
    });
  });