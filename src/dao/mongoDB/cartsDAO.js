import { cartsModel } from "../models/carts.model.js";

export class cartsDAO {
  async create() {
    return await cartsModel.create({ products: [], totalPrice: 0 });
  }

  async updateOne(_id, products = [], totalPrice = 0) {
    return await cartsModel.updateOne({ _id }, { products, totalPrice });
  }

  async getById(_id) {
    return await cartsModel.findById(_id).lean().populate("products.product");
  }
}
