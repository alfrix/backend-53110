import { cartService } from "../services/Carts.service.js";
import { productService } from "../services/Products.service.js";
import { ticketService } from "../services/Ticket.service.js";
import productsController from "./productsController.js";

export default class cartsController {
  static addCart = async (req, res, next) => {
    try {
      console.log("Agregando carrito");
      return await cartService.create({
        products: [],
        totalPrice: 0,
      });
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
      const product = await productService.getById(pid);
      const cart = await cartService.getById(cid);
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
      if (isNaN(total)) {
        throw new Error("Total is nan");
      }
      return await cartService.update(cid, cart.products, total);
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
      return await cartService.getById(cid);
    } catch (error) {
      console.error(`getCartById: ${error}`);
      next(error);
    }
  };

  static emptyCart = async (req, res, next) => {
    let { cid } = req.params;
    console.log("emptyCart");
    try {
      return await cartService.update(cid);
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
      const product = await productService.getById(pid);
      const cart = await cartService.getById(cid);
      let msg = "";
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
      return await cartService.update(cid, cart.products, total);
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
      const product = await productService.getById(pid);
      const cart = await cartService.getById(cid);
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
      return await cartService.update(cid, cart.products, total);
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
      const cart = await cartService.getById(cid);
      if (!products || !Array.isArray(products)) {
        throw new Error(`Products no validos: ${JSON.stringify(products)}`);
      }
      console.log("Verificando productos validos");
      products.forEach(async (product) => {
        await productService.getById(product);
      });
      cart.products = products;
      const total = this.calculateTotalPrice(cart.products);
      return await cartService.update(cid, cart.products, total);
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
        const cart = await cartService.getById(user.cart);
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
    console.log(products);
    const totalPrice = products.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0
    );
    console.log(`total es ${totalPrice} > ${totalPrice.toFixed(2)}`);
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
      const cart = await cartService.getById(cid);
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
      await cartService.update(cid, cart.products, cart.totalPrice - total);

      if (noStock.length > 0) {
        console.log(`Sin stock: ${JSON.stringify(noStock)}`);
      }

      let ticket = {
        code: Date.now(),
        purchase_datetime: new Date().toUTCString(),
        amount: total,
        purchaser: req.session.user.email,
      };
      const response = await ticketService.create(ticket);
      let newTicket;
      if (response.insertedId) {
        newTicket = await ticketService.getById(response.insertedId);
        if (!newTicket) {
          throw new Error(`Error buscando ticket: ${response.insertedId}`);
        }
      }
      return [(newTicket, response)];
    } catch (error) {
      console.error(`purchase: ${error}`);
      next(error);
    }
  };
}
