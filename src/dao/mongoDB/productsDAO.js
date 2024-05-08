import { productsModel } from "../models/products.model.js";

export class productsDAO {
  async getProductById(pid) {
    try {
      return await productsModel.findById(pid).lean();
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO getProductById");
      return undefined;
    }
  }

  async create(product) {
    try {
      return await productsModel.create(product);
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO create");
      return undefined;
    }
  }

  async updateOne(pid, product) {
    try {
      return await productsModel.updateOne({ _id: pid }, product);
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO updateOne");
      return undefined;
    }
  }

  async deleteOne(pid) {
    try {
      return await productsModel.deleteOne({ _id: pid });
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO deleteOne");
      return undefined;
    }
  }

  async paginate(query, options) {
    try {
      return await productsModel.paginate(query, options);
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO paginate");
      return undefined;
    }
  }

  async findById(pid) {
    try {
      return await productsModel.findById(pid).lean();
    } catch (error) {
      console.error(error);
      console.error("Error: productsDAO findById");
      return undefined;
    }
  }
}
