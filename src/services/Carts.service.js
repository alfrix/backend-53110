import { cartsDAO } from "../dao/mongoDB/cartsDAO.js";

class CartService {
  constructor(dao) {
    this.cartsDAO = dao;
  }

  async create(cart) {
    try {
      const response = await this.cartsDAO.create(cart);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return;
    } catch (error) {
      req.logger.error(`Error creando carrito`, error);
      throw new Error(`Fallo al crear carrito: ${error}`);
    }
  }

  async update(_id, products = [], totalPrice = 0) {
    try {
      const response = await this.cartsDAO.updateOne(_id, products, totalPrice);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      const product = await this.getById(_id);
      return [product, response];
    } catch (error) {
      req.logger.error(`Error actualizando carrito ID ${_id}`, error);
      throw new Error(`Fallo al actualizar carrito: ${error}`);
    }
  }

  async getById(_id) {
    try {
      const response = await this.cartsDAO.getById(_id);
      if (!response) {
        throw new Error(`No encontrado ${_id}`);
      }
      return response;
    } catch (error) {
      req.logger.error(`Error obteniendo carrito ID ${_id}`, error);
      throw new Error(`Fallo al obtener carrito: ${error}`);
    }
  }
}

export const cartService = new CartService(new cartsDAO());
