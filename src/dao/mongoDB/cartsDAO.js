import { cartsModel } from "../models/carts.model.js";

export class cartsDAO {
  async create(products = [], totalPrice = 0) {
    try {
      return await cartsModel.create({ products, totalPrice });
    } catch (error) {
      console.error(`Error creando carrito`, error);
      throw new Error(`Fallo al crear carrito: ${error._message}`);
    }
  }

  async updateOne(_id, products = [], totalPrice = 0) {
    try {
      return await cartsModel.updateOne({ _id }, { products, totalPrice });
    } catch (error) {
      console.error(`Error actualizando carrito ID ${_id}`, error);
      throw new Error(`Fallo al actualizar carrito: ${error._message}`);
    }
  }

  async getById(_id) {
    try {
      return await cartsModel.findById(_id).lean().populate("products.product");
    } catch (error) {
      console.error(`Error obteniendo carrito ID ${_id}`, error);
      throw new Error(`Fallo al obtener carrito: ${error._message}`);
    }
  }
}
