import { cartsModel } from "../models/carts.model.js";

export class cartsDAO {
  /**
   * [create a new cart]
   * @param {Array} products
   * @param {Number} totalPrice
   * @returns {Object}
   */
  async create(products = [], totalPrice = 0) {
    try {
      return await cartsModel.create({ products, totalPrice });
    } catch (error) {
      console.error(error);
      console.error("Error: cartsDAO create");
      return undefined;
    }
  }

  /**
   * [Updates one cart with the provided info]
   * @param {String} cid ObjectID
   * @param {Array} products
   * @param {Number} totalPrice
   * @returns {Object}
   */
  async updateOne(cid, { products = [], totalPrice = 0 }) {
    try {
      return await cartsModel.updateOne({ _id: cid }, { products, totalPrice });
    } catch (error) {
      console.error(error);
      console.error("Error: cartsDAO updateOne");
      return undefined;
    }
  }

  /**
   * [find and returns cart with id]
   * @param {String} cid ObjectID
   * @returns {Object}
   */
  async findById(cid) {
    try {
      return await cartsModel.findById(cid).lean().populate("products.product");
    } catch (error) {
      console.error(error);
      console.error("Error: cartsDAO findById");
      return undefined;
    }
  }
}
