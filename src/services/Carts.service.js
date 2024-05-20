import { cartsDAO } from "../dao/mongoDB/cartsDAO.js";

class CartService {
  constructor(dao) {
    this.cartsDAO = dao;
  }

  async create(cart) {
    return await this.cartsDAO.create(cart);
  }

  async update(_id, products = [], totalPrice = 0) {
    const response = await this.cartsDAO.updateOne(_id, products, totalPrice);
    const product = this.getById(_id);
    return [product, response];
  }

  async getById(_id) {
    return await this.cartsDAO.getById(_id);
  }
}

export const cartService = new CartService(new cartsDAO());
