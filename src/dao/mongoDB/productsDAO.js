import { productsModel } from "../models/products.model.js";

export class productsDAO {
  async getById(_id) {
    try {
      return await productsModel.findById(_id).lean();
    } catch (error) {
      console.error(`Error obteniendo producto con ID ${_id}:`, error);
      throw new Error(`Fallo al obtener producto: ${error}`);
    }
  }

  async create(product) {
    try {
      return await productsModel.create(product);
    } catch (error) {
      console.error("Error creando producto:", error);
      throw new Error(`Fallo al crear producto: ${error}`);
    }
  }

  async updateOne(_id, product) {
    try {
      return await productsModel.updateOne({ _id }, product);
    } catch (error) {
      console.error(`Error actualizando producto con ID ${_id}:`, error);
      throw new Error(`Fallo al actualizar producto: ${error}`);
    }
  }

  async deleteOne(_id) {
    try {
      return await productsModel.deleteOne({ _id });
    } catch (error) {
      console.error(`Error borrando producto con ID ${_id}:`, error);
      throw new Error(`Fallo al borrar producto : ${error}`);
    }
  }

  async paginate(query, options) {
    try {
      return await productsModel.paginate(query, options);
    } catch (error) {
      console.error("Error paginating products:", error);
      throw new Error(`Failed to paginate products: ${error}`);
    }
  }
}
