import { cartsDAO as cDAO } from "../dao/mongoDB/cartsDAO.js";
import { productsDAO as pDAO } from "../dao/mongoDB/productsDAO.js";

const productsDAO = new pDAO();
const cartsDAO = new cDAO();

export default class cartsController {
  static addCart = async (req, res) => {
    try {
      console.log("Agregando carrito");
      const response = await cartsDAO.create({ products: [], totalPrice: 0 });
      return response;
    } catch (error) {
      console.error(`addCart: ${error}`);
      throw error;
    }
  };

  static addProduct = async (req, res) => {
    let { cid, pid } = req.params;
    console.log(`Agregando producto ${pid} al carrito ${cid}`);
    try {
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
      const total = calculateTotalPrice(cart.products);
      let response = [];
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      response.push(await cartsDAO.findById(cid));
      response.push(mongores);
      return response;
    } catch (error) {
      console.error(`addProduct: ${error}`);
      throw error;
    }
  };

  static getCartById = async (req, res) => {
    let { cid } = req.params;
    console.log("getCartById");
    try {
      const response = await cartsDAO.findById(cid);
      return response;
    } catch (error) {
      console.error(`getCartById: ${error}`);
      throw error;
    }
  };

  static emptyCart = async (req, res) => {
    let { cid } = req.params;
    console.log("emptyCart");
    try {
      const response = await cartsDAO.updateOne(cid);
      return response;
    } catch (error) {
      console.error(`emptyCart: ${error}`);
      throw error;
    }
  };

  static removeProductfromCart = async (req, res) => {
    let { cid, pid } = req.params;
    console.log("removeProductfromCart");
    try {
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
      const total = calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      let response = [];
      response.push(await cartsDAO.findById(cid));
      response.push(mongores);
      return response;
    } catch (error) {
      console.error(`removeProductfromCart: ${error}`);
      throw error;
    }
  };

  static updateCartProduct = async (req, res) => {
    let { cid, pid } = req.params;
    let updatedProduct = req.body;
    console.log("updateCartProduct");
    try {
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
      const total = calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      let response = [];
      response.push(await cartsDAO.findById(cid));
      response.push(mongores);
      return response;
    } catch (error) {
      console.error(`updateCartProduct: ${error}`);
      throw error;
    }
  };

  static updateCart = async (req, res) => {
    let { cid } = req.params;
    let products = req.body;
    console.log("updateCart");
    try {
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
          throw new Error(`error inesperado ${error}`);
        }
      });
      cart.products = products;
      const total = calculateTotalPrice(cart.products);
      const mongores = await cartsDAO.updateOne(cid, {
        products: cart.products,
        totalPrice: total,
      });
      let response = [];
      response.push(await cartsDAO.findById(cid));
      response.push(mongores);
      return response;
    } catch (error) {
      console.error(`updateCart: ${error}`);
      throw error;
    }
  };

  static getCartItemCount = async (req, res) => {
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
        throw error;
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
}
