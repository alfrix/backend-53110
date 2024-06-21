import { productsDAO } from "../dao/mongoDB/productsDAO.js";
import { logger } from "../middlewares/log.js";

class ProductService {
  constructor(dao) {
    this.productsDAO = dao;
  }

  async create(product) {
    try {
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
    } catch (error) {
      logger.error("Error creando producto:", error);
      throw new Error(`Fallo al crear producto: ${error}`);
    }
  }

  async getById(_id) {
    try {
      const response = await this.productsDAO.getById(_id);
      if (!response) {
        const error = new Error(`No encontrado ${_id}`);
        error.statusCode = 404;
        throw error;
      }
      return response;
    } catch (error) {
      logger.error(`Error obteniendo producto con ID ${_id}:`, error);
      throw new Error(`Fallo al obtener producto: ${error}`);
    }
  }

  async update(_id, product) {
    logger.debug(`Actualizando producto id: ${_id}`);
    try {
      const response = await this.productsDAO.updateOne(_id, product);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      const updatedProduct = await this.getById(_id);
      return [updatedProduct, response];
    } catch (error) {
      logger.error(`Error actualizando producto con ID ${_id}:`, error);
      throw new Error(`Fallo al actualizar producto: ${error}`);
    }
  }

  async delete(_id) {
    logger.debug(`Borrando producto id: ${_id}`);
    try {
      const response = await this.productsDAO.deleteOne(_id);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return response;
    } catch (error) {
      logger.error(`Error borrando producto con ID ${_id}:`, error);
      throw new Error(`Fallo al borrar producto : ${error}`);
    }
  }

  async paginate(query, options) {
    try {
      const response = await this.productsDAO.paginate(query, options);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return response;
    } catch (error) {
      logger.error("Error paginating products:", error);
      throw new Error(`Failed to paginate products: ${error}`);
    }
  }
}

export const productService = new ProductService(new productsDAO());
