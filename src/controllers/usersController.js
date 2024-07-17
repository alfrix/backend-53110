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
    return await userService.findById(uid);
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
    user = await self.getUserById(uid)
    if (user.rol === "user") {
      if (!user.documents || user.documents.length === 0) {
        const error = new Error("Falta documentación");
        error.statusCode = 400;
        throw error;
      }
      user.rol = "premium";
    } else if (rol === "premium") {
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

    const response = await userService.update(
      { _id: userId },
      { $push: { documents: { $each: documents } } }
    );

    return response;
  }
}
