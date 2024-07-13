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

  async logLogin(email) {
    try {
      const user = await this.usersDAO.getByEmail(email);
      const timestamp = new Date().toUTCString()
      logger.debug(`${timestamp} ${user._id}`)
      return await this.usersDAO.updateOne({ _id: user._id }, { last_connection: timestamp });
    } catch (error) {
      logger.error(`Error actualizando fecha de inicio de sesión`, error);
    }
  }
}

export const userService = new UserService(new usersDAO());
