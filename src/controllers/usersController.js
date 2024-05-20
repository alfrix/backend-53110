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
    console.log("Agregando usuario");
    try {
      let user_db = await userService.create(user);
      user_db = user_db.toJSON();

      console.log("Asignando carrito al usuario");
      const cart = await cartService.create();
      console.log(cart);
      await userService.update({ _id: user_db._id }, { cart });
      return { ...user_db, cart };
    } catch (error) {
      console.log(`Error creando usuario: ${error}`);
      return { error };
    }
  };

  static getUserById = async (uid) => {
    if (uid === -1) {
      return admin;
    }
    try {
      return await userService.findById(uid);
    } catch (error) {
      console.error(`Error obteniendo usuario: ${error}`);
      return error;
    }
  };

  static getUserByEmail = async (email) => {
    console.log("getUserByEmail", email);
    if (email === "adminCoder@coder.com") {
      return admin;
    }
    try {
      return await userService.getByEmail(email);
    } catch (error) {
      console.error(`Error obteniendo usuario: ${error}`);
      return error;
    }
  };
}
