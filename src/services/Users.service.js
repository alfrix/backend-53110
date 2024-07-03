import { usersDAO } from "../dao/mongoDB/usersDAO.js";
import { logger } from "../middlewares/log.js";

class UserService {
  constructor(dao) {
    this.usersDAO = dao;
  }
  async create(user) {
    try {
      return await this.usersDAO.create(user);
    } catch (error) {
      logger.error(`Error creando usuario`, error);
      throw new Error(`Fallo al crear usuario: ${error}`);
    }
  }

  async update(_id, data) {
    try {
      return await this.usersDAO.updateOne(_id, data);
    } catch (error) {
      logger.error(`Error actualizando usuario`, error);
      throw new Error(`Fallo al actualizar usuario: ${error}`);
    }
  }
  async getByEmail(email) {
    if (!email) {
      throw new Error("email no especificado");
    }
    try {
      return await this.usersDAO.getByEmail(email);
    } catch (error) {
      logger.error(`Error obteniendo usuario`, error);
      throw new Error(`Fallo al obtener usuario: ${error}`);
    }
  }

  async getById(_id) {
    try {
      return await this.usersDAO.getById(_id);
    } catch (error) {
      logger.error(`Error obteniendo usuario`, error);
      throw new Error(`Fallo al obtener usuario: ${error}`);
    }
  }
}

export const userService = new UserService(new usersDAO());
