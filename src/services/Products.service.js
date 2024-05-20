import { productsDAO } from "../dao/mongoDB/productsDAO.js";

class ProductService {
  constructor(dao) {
    this.productsDAO = dao;
  }

  async create(product) {
    const response = await this.productsDAO.create(product);
    if (!response) {
      throw new Error(`Error creando producto: ${JSON.stringify(product)}`);
    }
    let createdProduct;
    if (response.insertedId) {
      createdProduct = await this.getById(response.insertedId);
      if (!createdProduct) {
        throw new Error(`Error buscando producto: ${response.insertedId}`);
      }
    }
    return [createdProduct, response];
  }

  async getById(_id) {
    const response = await this.productsDAO.getById(_id);
    if (!response) {
      const error = new Error(`Error buscando producto ${_id}`);
      error.statusCode = 404;
      throw error;
    }
    return response;
  }

  async update(_id, product) {
    console.log(`Actualizando producto id: ${_id}`);
    const response = await this.productsDAO.updateOne(_id, product);
    const updatedProduct = await this.getById(_id);
    return [updatedProduct, response];
  }

  async delete(_id) {
    const deletedProduct = await this.getById(_id);
    const response = await this.productsDAO.deleteOne(_id);
    return [response, deletedProduct];
  }

  async paginate(query, options) {
    return await this.productsDAO.paginate(query, options);
  }
}

export const productService = new ProductService(new productsDAO());
