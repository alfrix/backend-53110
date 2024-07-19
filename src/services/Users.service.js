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

  async getAll() {
    try {
      return await this.usersDAO.getAll();
    }
    catch (error) {
      logger.error(`Error obteniendo usuarios`, error);
      throw new Error(`Fallo al obtenier usuarios: ${error}`);
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

  async delete(user) {
    try {
      return await this.usersDAO.delete(user._id);
    } catch (error) {
      logger.error(`Error borrando usuario`, error);
      throw new Error(`Fallo al borrar usuario: ${error}`);
    }
  }

  async paginate(query, options) {
    try {
      const response = await this.usersDAO.paginate(query, options);
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

export const userService = new UserService(new usersDAO());
