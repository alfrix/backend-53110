import { cartService } from "../services/Carts.service.js";
import { productService } from "../services/Products.service.js";
import { ticketService } from "../services/Ticket.service.js";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig(
  {
    accessToken: process.env.MP_KEY
  }
);

export default class cartsController {
  static addCart = async (req, res, next) => {
    req.logger.debug("Agregando carrito");
    return await cartService.create();
  };

  static addProduct = async (req, res, next) => {
    let { cid, pid } = req.params;
    req.logger.debug(`Agregando producto ${pid} al carrito ${cid}`);
    this.validateCartFromUser(req, cid);
    const product = await productService.getById(pid);
    if (product.owner === req.session.user.email) {
      throw new Error("No puede agregar sus propios productos al carrito");
    }
    const cart = await cartService.getById(cid);
    req.logger.debug(`Producto es ${JSON.stringify(product)}`);
    let exists = undefined;
    req.logger.debug(`Carrito contiene ${cart.products.length} productos`);
    if (cart.products.length > 0) {
      req.logger.debug(`Productos: ${JSON.stringify(cart.products)}`);
      exists = cart.products.find((product) => product.product._id.equals(pid));
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
      req.logger.debug(msg)
      cart.products.push(p);
    }
    const total = this.calculateTotalPrice(cart.products);
    if (isNaN(total)) {
      throw new Error("Total is nan");
    }
    return await cartService.update(cid, cart.products, total);
  };

  static getCartById = async (req, res, next) => {
    let { cid } = req.params;
    req.logger.debug("getCartById");
    this.validateCartFromUser(req, cid);
    return await cartService.getById(cid);
  };


  static deleteCart = async (req, res, next) => {
    let { cid } = req.params;
    return this.emptyCart(req, res, next)
  };

  static emptyCart = async (req, res, next) => {
    let { cid } = req.params;
    req.logger.debug("emptyCart");
    return await cartService.update(cid);
  };

  static removeProductfromCart = async (req, res, next) => {
    let { cid, pid } = req.params;
    req.logger.debug("removeProductfromCart");
    this.validateCartFromUser(req, cid);
    const product = await productService.getById(pid);
    const cart = await cartService.getById(cid);
    let msg = "";
    let exists = undefined;
    let qty = 1;
    if (cart.products.length > 0) {
      exists = cart.products.find((product) => product.product._id.equals(pid));
    }
    if (exists) {
      const index = cart.products.findIndex((product) =>
        product.product._id.equals(pid)
      );
      msg = `Producto ${pid} existe en el carrito: ${cid} restando 1 unidad`;
      if (cart.products[index].quantity == 1) {
        req.logger.debug(`cantidad ${cart.products[index].quantity}`);
        cart.products.splice(index, 1);
      } else {
        cart.products[index].quantity -= qty;
        cart.products[index].productPriceTotal = parseFloat(
          exists.product.price * cart.products[index].quantity
        ).toFixed(2);
      }
    }
    req.logger.debug(msg);
    const total = this.calculateTotalPrice(cart.products);
    return await cartService.update(cid, cart.products, total);
  };

  static updateCartProduct = async (req, res, next) => {
    let { cid, pid } = req.params;
    let updatedProduct = req.body;
    req.logger.debug("updateCartProduct");
    this.validateCartFromUser(req, cid);
    const product = await productService.getById(pid);
    const cart = await cartService.getById(cid);
    let exists = undefined;
    if (cart.products.length > 0) {
      exists = cart.products.find((product) => product.product._id.equals(pid));
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
  };

  static updateCart = async (req, res, next) => {
    let { cid } = req.params;
    let updatedCart = req.body;
    req.logger.debug("updateCart");
    this.validateCartFromUser(req, cid);
    const cart = await cartService.getById(cid);
    if (!updatedCart || !updatedCart.products) {
      throw new Error(`Cart no valido: ${JSON.stringify(updatedCart)}`);
    }
    req.logger.debug("Verificando productos validos");
    for (let product of updatedCart.products) {
      await productService.getById(product.product._id);
    };
    cart.products = updatedCart.products;
    req.logger.debug(JSON.stringify(cart.products))
    const total = this.calculateTotalPrice(cart.products);
    req.logger.debug(`total: ${total}`);
    return await cartService.update(cid, cart.products, total);
  };

  static getCartItemCount = async (req, res, next) => {
    req.logger.debug("getCartItemCount");
    let user = req.session.user;
    let cartItemCount = 0;
    if (user && user.cart) {
      const cart = await cartService.getById(user.cart);
      cartItemCount = cart.products.reduce(
        (total, product) => total + product.quantity,
        0
      );
    }
    return cartItemCount;
  };

  static calculateTotalPrice(products) {
    if (!Array.isArray(products)) {
      throw new Error("Invalid products array");
    }
    const totalPrice = products.reduce((total, item) => {
      if (Array.isArray(item.products)) {
        const subTotal = item.products.reduce(
          (subTotal, subItem) => subTotal + parseFloat(subItem.productPriceTotal),
          0
        );
        return total + subTotal;
      }
      return total + parseFloat(item.productPriceTotal);
    }, 0);
    return totalPrice.toFixed(2);
  }


  static validateCartFromUser(req, cart) {
    const user = req.session.user
    if (!user) {
      const error = new Error("No autenticado");
      error.statusCode = 401;
      throw error;
    } else if (user.rol === "admin") {
      req.logger.debug(`Acceso de admin a carrito: ${cart}`);
      return;
    } else if (process.env.NODE_ENV === 'testing') {
      return
    } else if (user.cart !== cart) {
      const error = new Error("No autorizado");
      error.statusCode = 403;
      throw error;
    }
  }

  static purchase = async (req, res, next) => {
    let { cid } = req.params;
    req.logger.debug("purchase");
    await this.validateCartFromUser(req, cid);
    const cart = await cartService.getById(cid);

    let withStock = [];
    let noStock = [];
    let total = 0;

    for (const cartProduct of cart.products) {
      const product = await productService.getById(cartProduct.product._id);
      if (!product) {
        const error = new Error(`Product not found: ${cartProduct.product._id}`);
        error.statusCode = 404;
        throw error;
      }
      if (cartProduct.quantity > product.stock) {
        noStock.push(product._id);
      } else {
        product.stock -= cartProduct.quantity;
        await productService.update(product._id, product)
        total += cartProduct.quantity * product.price;
        withStock.push({
          product: {
            _id: product._id,
            title: product.title,
            price: product.price
          },
          quantity: cartProduct.quantity
        });
      }
    }

    if (isNaN(total) || total < 1) {
      const error = new Error(`Total invalido: ${total}`);
      error.statusCode = 400;
      throw error;
    }

    for (const removeProduct of withStock) {
      const index = cart.products.findIndex(p => p.product._id.equals(removeProduct.product._id));
      if (index !== -1) cart.products.splice(index, 1);
    }
    await cartService.update(cid, cart.products, cart.totalPrice - total);

    if (noStock.length > 0) {
      req.logger.debug(`Out of stock: ${JSON.stringify(noStock)}`);
      const error = new Error("Algunos productos no tienen stock");
      error.statusCode = 400;
      error.reload = true
      throw error;
    }

    let ticket = {
      code: Date.now(),
      purchase_datetime: new Date().toUTCString(),
      amount: total,
      purchaser: req.session.user.email,
    };
    const response = await ticketService.create(ticket);
    req.logger.debug(`Ticket Response: ${response}`);
    let newTicket = response._id ? response : null;
    if (!newTicket) {
      const error = new Error("Fallo al crear el ticket");
      error.statusCode = 500;
      throw error;
    }
    if (!cart.products) {
      const error = new Error("Sin Productos");
      error.statusCode = 400;
      throw error;
    }
    return { ticket: newTicket, products: withStock };
  };

  static pay = async (req, res) => {
    let { ticket, products } = req.body
    req.logger.debug(`Ticket: ${JSON.stringify(ticket)}`)
    req.logger.debug(`Products: ${JSON.stringify(products)}`)

    if (!ticket) throw new Error("ticket invalido")
    if (!products) throw new Error("productos invalidos")

    const importe = parseFloat(ticket.amount)
    if (importe < 1 || isNaN(importe)) {
      const error = new Error(`Importe inválido: ${importe}`);
      error.statusCode = 400;
      throw error;
    }

    let items = [];
    products.forEach((item) => {
      items.push({
        id: item.product._id,
        title: item.product.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.product.price)
      });
    });

    const preference = new Preference(client);

    let resultado = await preference.create({
      body: {
        items,
        back_urls: {
          "success": "http://localhost:8080/feedback",
          "failure": "http://localhost:8080/feedback",
          "pending": "http://localhost:8080/feedback"
        },
        auto_return: "approved",
      }
    });
    return { id: resultado.id }
  }
}
