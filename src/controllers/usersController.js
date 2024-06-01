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

export default class usersController {
  static create = async (user) => {
    if (user._id) {
      delete user._id;
    }
    user.rol = "user";
    req.logger.debug("Agregando usuario");
    let user_db = await userService.create(user);
    user_db = user_db.toJSON();

    req.logger.debug("Asignando carrito al usuario");
    const cart = await cartService.create();
    await userService.update({ _id: user_db._id }, { cart });
    return { ...user_db, cart };
  };

  static getUserById = async (uid) => {
    if (uid === -1) {
      return admin;
    }
    return await userService.findById(uid);
  };

  static getUserByEmail = async (email) => {
    req.logger.debug("getUserByEmail", email);
    if (email === "adminCoder@coder.com") {
      return admin;
    }
    return await userService.getByEmail(email);
  };
}
