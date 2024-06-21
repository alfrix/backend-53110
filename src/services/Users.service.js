import { usersDAO } from "../dao/mongoDB/usersDAO.js";
import { logger } from "../middlewares/log.js";

class UserService {
  constructor(dao) {
    this.usersDAO = dao;
  }
  async create(user) {
    try {
      const response = await this.usersDAO.create(user);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return response;
    } catch (error) {
      logger.error(`Error creando usuario`, error);
      throw new Error(`Fallo al crear usuario: ${error}`);
    }
  }

  async update(_id, data) {
    try {
      const response = await this.usersDAO.updateOne(_id, data);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return response;
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
      const response = await this.usersDAO.getByEmail(email);
      if (!response) {
        throw new Error(`No encontrado ${email}`);
      }
      return response;
    } catch (error) {
      logger.error(`Error obteniendo usuario`, error);
      throw new Error(`Fallo al obtener usuario: ${error}`);
    }
  }

  async getById(_id) {
    try {
      const response = await this.usersDAO.getById(_id);
      if (!response) {
        throw new Error(`No encontrado ${_id}`);
      }
      return response;
    } catch (error) {
      logger.error(`Error obteniendo usuario`, error);
      throw new Error(`Fallo al obtener usuario: ${error}`);
    }
  }
}

export const userService = new UserService(new usersDAO());
