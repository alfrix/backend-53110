import { usersModel } from "../models/users.model.js";

export class usersDAO {
  async create(user) {
    try {
      return await usersModel.create(user);
    } catch (error) {
      console.error(`Error creando usuario`, error);
      throw new Error("Fallo al crear usuario");
    }
  }

  async updateOne(_id, cart) {
    try {
      return await usersModel.updateOne(_id, cart);
    } catch (error) {
      console.error(`Error actualizando usuario`, error);
      throw new Error("Fallo al actualizar usuario");
    }
  }

  async getBy({ filter = {} }) {
    try {
      return await usersModel.findOne(filter).lean();
    } catch (error) {
      console.error(`Error obteniendo usuario`, error);
      throw new Error("Fallo al obtener usuario");
    }
  }
}
