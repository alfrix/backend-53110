import { productsModel } from "../models/products.model.js";

export class productsDAO {
  async getById(_id) {
    return await productsModel.findById(_id).lean();
  }

  async create(product) {
    return await productsModel.create(product);
  }

  async updateOne(_id, product) {
    return await productsModel.updateOne({ _id }, product);
  }

  async deleteOne(_id) {
    return await productsModel.deleteOne({ _id });
  }

  async paginate(query, options) {
    return await productsModel.paginate(query, options);
  }
}
