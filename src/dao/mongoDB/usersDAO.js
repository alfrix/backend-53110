import { usersModel } from "../models/users.model.js";

export class usersDAO {
  async create(user) {
    return await usersModel.create(user);
  }

  async updateOne(_id, cart) {
    return await usersModel.updateOne(_id, cart);
  }

  async getBy({ filter = {} }) {
    return await usersModel.findOne(filter).lean();
  }
}
