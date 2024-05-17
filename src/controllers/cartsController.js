import { cartsDAO as cDAO } from "../dao/mongoDB/cartsDAO.js";
import { productsDAO as pDAO } from "../dao/mongoDB/productsDAO.js";
import { ticketsDAO } from "../dao/mongoDB/ticketsDAO.js";
import productsController from "./productsController.js";

const productsDAO = new pDAO();
const cartsDAO = new cDAO();

export default class cartsController {
  static addCart = async (req, res, next) => {
    try {
      console.log("Agregando carrito");
      const response = await cartsDAO.create({ products: [], totalPrice: 0 });
      if (!response) {
        throw new Error(`Error creando carrito: ${cid}`);
      }
      return response;
    } catch (error) {
      console.error(`addCart: ${error}`);
      next(error);
    }
  };

  static addProduct = async (req, res, next) => {
    let { cid, pid } = req.params;
    console.log(`Agregando producto ${pid} al carrito ${cid}`);
    try {
      this.validateCartFromUser(req.session.user, cid);
      const product = await productsDAO.findById(pid);
      const cart = await cartsDAO.findById(cid);
      if (!cart || !product) {
        if (!cart) {
          throw new Error(`Cart Id no valida: ${cid}`);
        } else {
          throw new Error(`Product Id no valida: ${pid}`);
        }
      }
      console.log(cart);
      console.log(`Producto es ${JSON.stringify(product)}`);
      let exists = undefined;
      console.log(`Carrito contiene ${cart.products.length} productos`);
      if (cart.products.length > 0) {
        console.log(`Productos: ${JSON.stringify(cart.products)}`);
        exists = cart.products.find((product) =>
          product.product._id.equals(pid)
        );
      }
      let msg = "";
      let qty = 1;
      if (exists) {
        const index = cart.products.findIndex((product) =>
          product.product._id.equals(pid)
        );
        msg = `Producto ${pid} existe en el carrito: ${cid} sumando 1 unidad`;
        cart.products[index].quantity += qty;
        cart.products[index].productPriceTotal = parseFloat(
          exists.product.price * cart.products[index].quantity
        ).toFixed(2);
      } else {
        msg = `Producto ${pid} agregado al carrito: ${cid}`;
        let p = {
          product: pid,
          quantity: qty,
          productPriceTotal: product.price,
        };
        cart.products.push(p);
      }
      console.log(msg);
      const total = this.calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      if (!mongores) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }
      const daores = await cartsDAO.findById(cid);
      if (!daores) {
        throw new Error(`Error devolviendo carrito: ${cid}`);
      }
      return [daores, mongores];
    } catch (error) {
      console.error(`addProduct: ${error}`);
      next(error);
    }
  };

  static getCartById = async (req, res, next) => {
    let { cid } = req.params;
    console.log("getCartById");
    try {
      this.validateCartFromUser(req.session.user, cid);
      const response = await cartsDAO.findById(cid);
      if (!response) {
        throw new Error(`Cart Id no valida: ${cid}`);
      }
      return response;
    } catch (error) {
      console.error(`getCartById: ${error}`);
      next(error);
    }
  };

  static emptyCart = async (req, res, next) => {
    let { cid } = req.params;
    console.log("emptyCart");
    try {
      const response = await cartsDAO.updateOne(cid);
      if (!response) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }
      return response;
    } catch (error) {
      console.error(`emptyCart: ${error}`);
      next(error);
    }
  };

  static removeProductfromCart = async (req, res, next) => {
    let { cid, pid } = req.params;
    console.log("removeProductfromCart");
    try {
      this.validateCartFromUser(req.session.user, cid);
      const product = await productsDAO.findById(pid);
      const cart = await cartsDAO.findById(cid);
      let msg = "";
      if (!cart || !product) {
        if (!cart) {
          throw new Error(`Cart Id no valida: ${cid}`);
        } else {
          throw new Error(`Product Id no valida: ${pid}`);
        }
      }
      let exists = undefined;
      let qty = 1;
      if (cart.products.length > 0) {
        exists = cart.products.find((product) =>
          product.product._id.equals(pid)
        );
      }
      if (exists) {
        const index = cart.products.findIndex((product) =>
          product.product._id.equals(pid)
        );
        msg = `Producto ${pid} existe en el carrito: ${cid} restando 1 unidad`;
        if (cart.products[index].quantity == 1) {
          console.log(`cantidad ${cart.products[index].quantity}`);
          cart.products.splice(index, 1);
        } else {
          cart.products[index].quantity -= qty;
          cart.products[index].productPriceTotal = parseFloat(
            exists.product.price * cart.products[index].quantity
          ).toFixed(2);
        }
      }
      console.log(msg);
      const total = this.calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      if (!mongores) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }
      const daores = await cartsDAO.findById(cid);
      if (!daores) {
        throw new Error(`Error devolviendo carrito: ${cid}`);
      }
      return [daores, mongores];
    } catch (error) {
      console.error(`removeProductfromCart: ${error}`);
      next(error);
    }
  };

  static updateCartProduct = async (req, res, next) => {
    let { cid, pid } = req.params;
    let updatedProduct = req.body;
    console.log("updateCartProduct");
    try {
      this.validateCartFromUser(req.session.user, cid);
      const product = await productsDAO.findById(pid);
      const cart = await cartsDAO.findById(cid);
      if (!cart || !product) {
        if (!cart) {
          throw new Error(`Cart Id no valida: ${cid}`);
        } else {
          throw new Error(`Product Id no valida: ${pid}`);
        }
      }
      let exists = undefined;
      if (cart.products.length > 0) {
        exists = cart.products.find((product) =>
          product.product._id.equals(pid)
        );
      }
      if (exists) {
        const index = cart.products.findIndex((product) =>
          product.product._id.equals(pid)
        );
        if (!updatedProduct.quantity || isNaN(updatedProduct.quantity)) {
          throw new Error(
            'Product quantity not provided, send {"quantity": Number}'
          );
        }
        cart.products[index].quantity = updatedProduct.quantity;
        cart.products[index].productPriceTotal = parseFloat(
          exists.product.price * cart.products[index].quantity
        ).toFixed(2);
      } else {
        throw new Error("Product not in cart");
      }
      const total = this.calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      if (!mongores) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }
      const daores = await cartsDAO.findById(cid);
      if (!daores) {
        throw new Error(`Error devolviendo carrito: ${cid}`);
      }
      return [daores, mongores];
    } catch (error) {
      console.error(`updateCartProduct: ${error}`);
      next(error);
    }
  };

  static updateCart = async (req, res, next) => {
    let { cid } = req.params;
    let products = req.body;
    console.log("updateCart");
    try {
      this.validateCartFromUser(req.session.user, cid);
      const cart = await cartsDAO.findById(cid);
      if (!cart || !products || !Array.isArray(products)) {
        if (!cart) {
          throw new Error(`Cart Id no valida: ${cid}`);
        } else {
          throw new Error(`Products no validos: ${JSON.stringify(products)}`);
        }
      }
      products.forEach(async (product) => {
        try {
          await productsDAO.findById(product);
        } catch (error) {
          throw new Error(`Error en los productos ${error}`);
        }
      });
      cart.products = products;
      const total = this.calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      if (!mongores) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }
      const daores = await cartsDAO.findById(cid);
      if (!daores) {
        throw new Error(`Error devolviendo carrito: ${cid}`);
      }
      return [daores, mongores];
    } catch (error) {
      console.error(`updateCart: ${error}`);
      next(error);
    }
  };

  static getCartItemCount = async (req, res, next) => {
    let user = req.session.user;
    let cartItemCount = 0;
    if (user && user.cart) {
      try {
        const cart = await cartsDAO.findById(user.cart);
        cartItemCount = cart.products.reduce(
          (total, product) => total + product.quantity,
          0
        );
      } catch (error) {
        console.error(`getCartItemCount: ${error}`);
        next(error);
      }
    }
    return cartItemCount;
  };

  static calculateTotalPrice(products) {
    if (!Array.isArray(products)) {
      throw new Error("Invalid products array");
    }
    let totalPrice = 0;
    products.forEach((item) => {
      totalPrice += Number(item.product.price) * item.quantity;
    });
    return totalPrice.toFixed(2);
  }

  static validateCartFromUser(user, cart) {
    if (!user) {
      const error = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    } else if (user.rol === "admin") {
      console.log(`Acceso de admin a carrito: ${cart}`);
      return;
    } else if (user.cart !== cart) {
      const error = new Error("Not autorized");
      error.statusCode = 403;
      throw error;
    }
  }

  static purchase = async (req, res, next) => {
    let { cid } = req.params;
    console.log("purchase");
    try {
      this.validateCartFromUser(req.session.user, cid);
      const cart = await cartsDAO.findById(cid);
      if (!cart) {
        throw new Error(`Obteniendo carrito: ${cid}`);
      }

      let withStock = [];
      let noStock = [];
      let total = 0;
      cart.products.forEach(async (cartProduct) => {
        product = await productsController.getProductById(product._id);
        if (cartProduct.quantity > product.stock) {
          noStock.push(product._id);
        } else {
          product.stock -= cartProduct.quantity;
          await productsController.updateProduct(product);
          total += cartProduct.quantity * product.price;
          withStock.push(product._id);
        }
      });

      withStock.forEach(async (removeProduct) => {
        const index = cart.products.findIndex((products) =>
          products.product._id.equals(removeProduct)
        );
        cart.products.splice(index, 1);
      });
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: cart.totalPrice - total,
      });
      if (!mongores) {
        throw new Error(`Error actualizando carrito: ${cid}`);
      }

      if (noStock.length > 0) {
        console.log(`Sin stock: ${JSON.stringify(noStock)}`);
      }

      let ticket = {
        code: Date.now(),
        purchase_datetime: new Date().toUTCString(),
        amount: total,
        purchaser: req.session.user.email,
      };
      const res1 = await ticketsDAO.create(ticket);
      if (!res1) {
        throw new Error(`Error creando ticket: ${JSON.stringify(ticket)}`);
      }
      let res2;
      if (res1.insertedId) {
        res2 = await ticketsDAO.findById(res1.insertedId);
        if (!res2) {
          throw new Error(`Error buscando ticket: ${res1.insertedId}`);
        }
      }
      const response = [res2, res1];
    } catch (error) {
      console.error(`purchase: ${error}`);
      next(error);
    }
  };
}
