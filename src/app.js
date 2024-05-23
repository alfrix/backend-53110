import { config } from "./config/config.js";
import express from "express";
import "express-async-errors";
import session from "express-session";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "node:path";
import { __dirname } from "./utils.js";
import { router as productsRouter } from "./routes/productsRouter.js";
import { router as cartRouter } from "./routes/cartRouter.js";
import { router as viewsRouter } from "./routes/viewsRouter.js";
import { router as sessionRouter } from "./routes/sessionRouter.js";
import { router as mockRouter } from "./routes/mockRouter.js";
import mongoose from "mongoose";
import productsController from "./controllers/productsController.js";
import MongoStore from "connect-mongo";
import passport from "passport";
import { initPassport } from "./config/passport.config.js";
import { apiErrorHandler } from "./middlewares/apiErrorHandler.js";
import favicon from "serve-favicon";

const PORT = config.PORT;
const mongoUrl = config.mongoUrl;
const dbName = config.dbName;

const app = express();
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
const server = app.listen(PORT, () => {
  console.log(`Server OK en puerto ${PORT}`);
});
const io = new Server(server);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(
  session({
    secret: "CoderCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl, ttl: 60 }),
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(
  "/api/products",
  (req, res, next) => {
    req.io = io;
    next();
  },
  productsRouter
);

app.use("/api/carts", cartRouter);
app.use("/api/session", sessionRouter);
app.use("/api/mockingproducts", mockRouter);

app.use(apiErrorHandler);

app.use(
  "/",
  (req, res, next) => {
    req.io = io;
    next();
  },
  viewsRouter
);

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.log("Unhandled Exception at:", err, "reason:", origin);
});

const connectDB = async () => {
  try {
    console.log(`Conectando a ${mongoUrl}`);
    await mongoose.connect(mongoUrl, { dbName });
    console.log(`DB ${dbName} Conectada`);
  } catch (error) {
    console.log("ERROR al conectar:", error.message);
  }
};

connectDB();

let messages = [];
let users = [];

io.on("connection", (socket) => {
  console.log(`Conectado id: ${socket.id}`);

  socket.on("getProducts", async () => {
    try {
      let req = {
        views: true,
        query: {
          limit: 20,
          page: 1,
        },
      };
      const products = await productsController.getProducts(req);
      io.emit("showProducts", products);
    } catch (error) {
      console.error("Error getting products:", error);
    }
  });

  socket.on("welcome", (name) => {
    users.push({ id: socket.id, name });
    socket.emit("history", messages);
    socket.broadcast.emit("newUser", name);
  });

  socket.on("message", (name, msg) => {
    const timestamp = new Date().toUTCString();
    messages.push({ name, msg, timestamp });
    io.emit("newMessage", name, msg, timestamp);
  });

  socket.on("disconnect", () => {
    console.log(`Desconectado id: ${socket.id}`);
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      const timestamp = new Date().toUTCString();
      socket.broadcast.emit("userDisconnect", user.name, timestamp);
      const index = users.indexOf(user);
      users.splice(index, 1);
    }
  });
});
