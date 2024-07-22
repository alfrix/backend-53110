const admin = {
  _id: -1,
  first_name: "Admin",
  last_name: "Coder",
  email: "adminCoder@coder.com",
  password: "$2b$10$3RczyzSqgKpRgjebXDtcoeYCsQzgD3O.vdeALJ5HGZAkQx988OA1y",
  rol: "admin",
};

import { cartService } from "../services/Carts.service.js";
import { userService } from "../services/Users.service.js";
import { UserDTO } from "../dao/UserDTO.js";
import { logger } from "../middlewares/log.js";
import { sendEmail } from "../mailer.js";

export default class usersController {
  static create = async (user) => {
    if (user._id) {
      delete user._id;
    }
    user.rol = "user";
    logger.debug("Agregando usuario");
    let user_db = await userService.create(user);
    user_db = user_db.toJSON();

    logger.debug("Asignando carrito al usuario");
    const cart = await cartService.create();
    await userService.update({ _id: user_db._id }, { cart });
    return { ...user_db, cart };
  };

  static getAll = async () => {
    return await userService.getAll();
  }

  static getUserById = async (uid) => {
    if (uid === -1) {
      return admin;
    }
    return await userService.getById(uid);
  };

  static getUserByEmail = async (email) => {
    logger.debug("getUserByEmail", email);
    if (email === "adminCoder@coder.com") {
      return admin;
    }
    return await userService.getByEmail(email);
  };

  static togglePremium = async (req, res, next) => {
    let { uid } = req.params;
    req.logger.debug("togglePremium", uid);
    if (uid === -1) {
      const error = new Error(
        "Id no valida"
      );
      error.statusCode = 400;
      throw error;
    }
    let user = await this.getUserById(uid)
    if (user.rol === "user") {
      if (!user.documents || user.documents.length === 0) {
        const error = new Error("Falta documentación");
        error.statusCode = 400;
        throw error;
      }
      user.rol = "premium";
    } else if (user.rol === "premium") {
      user.rol = "user"
    } else {
      const error = new Error(`Rol no valido ${user.rol}`);
      error.statusCode = 400;
      throw error;
    }
    let response = await userService.update(uid, { rol: user.rol })
    return new UserDTO(response)
  }

  static addDocument = async (req, res, next) => {
    const userId = req.params.uid;

    if (req.session.user.id !== userId && req.session.user.rol !== 'admin') {
      const error = new Error("No autorizado");
      error.statusCode = 403;
      throw error;
    }

    const files = req.files || {};
    const documents = [];

    for (const [key, value] of Object.entries(files)) {
      documents.push({
        name: key,
        reference: value[0].path
      });
    }

    let response = await userService.update(
      { _id: userId },
      { $push: { documents: { $each: documents } } }
    );

    response = { message: "Carga exitosa", ...response }

    return response;
  }

  static delete = async (req, res, next) => {
    let { uid } = req.params;
    req.logger.debug(`Borrando id: ${uid}`);
    const user = await userService.getById(uid);
    if (!user || user.rol === "admin") {
      let error = new Error(`deleteUser: No se puede borrar id: ${uid}`);
      error.statusCode = 404;
      throw error;
    }
    let response = await userService.delete(user);
    if (!response) {
      let error = new Error(`deleteUser: No se puede borrar id: ${pid}`);
      error.statusCode = 500;
      throw error;
    }
    req.logger.info("Enviando correo informativo")
    const message = "Usuario borrado"
    response = { message, ...response }
    await sendEmail(user.email, message, "Atención se borró su usuario");
    return response;
  };

  static deleteInactive = async () => {
    let users = await this.getAll();
    let now = new Date();
    let inactiveLimit = 2 * 24 * 60 * 60 * 1000; // 2 dias en ms
    let deletedUsers = []
    for (let user of users) {
      let lastConnection = new Date(user.last_connection);
      if (isNaN(lastConnection.getTime())) {
        logger.error(`Ultima conexión invalida: ${user}`)
        continue;
      }
      let timeDiff = now - lastConnection;
      if (timeDiff > inactiveLimit) {
        let deleted = await userService.delete(user);
        if (deleted && deleted.deletedCount > 0) {
          deletedUsers.push(deleted)
        }
      }
    }

    return {
      success: true,
      message: "Inactive users of more than 2 days have been deleted",
      payload: deletedUsers
    };
  };

  static getUsers = async (req, res, next) => {
    let { limit, page, query, sort = "" } = req.query;
    if (!query) {
      query = {};
    } else {
      try {
        req.logger.debug(query);
        query = JSON.parse(query);
      } catch (error) {
        const err = new Error(`Unable to parse JSON query ${query} ${error}`);
        error.statusCode = 400;
        throw err;
      }
    }

    if (["asc", "desc"].includes(sort)) {
      sort = { email: sort };
    } else {
      if (sort) req.logger.error(`sort not valid ${sort}`);
      sort = {};
    }

    !limit || isNaN(limit) || limit < 1
      ? (limit = 10)
      : (limit = Math.floor(limit));
    !page || isNaN(page) || page < 1 ? (page = 1) : (page = Math.floor(page));
    let options = {
      page,
      limit,
      lean: true,
      sort,
    };

    let {
      docs: users,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
    } = await userService.paginate(query, options);
    const response = {
      status: "success",
      payload: users,
      totalPages: totalPages,
      prevPage: prevPage,
      nextPage: nextPage,
      page: page,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage,
    };
    return response;
  };

}
