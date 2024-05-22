import { usersModel } from "../models/users.model.js";

export class usersDAO {
  async create(user) {
    return await usersModel.create(user);
  }

  async updateOne(_id, cart) {
    return await usersModel.updateOne(_id, cart);
  }

  async getByEmail(email) {
    return await usersModel.findOne({ email }).lean();
  }

  async getById(_id) {
    return await usersModel.findById(_id).lean();
  }
}
