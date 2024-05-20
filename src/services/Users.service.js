import { usersDAO } from "../dao/mongoDB/usersDAO.js";

class UserService {
  constructor(dao) {
    this.usersDAO = dao;
  }
  async create(user) {
    return await this.usersDAO.create(user);
  }

  async updateOne(_id, cart) {
    return await this.usersDAO.updateOne(_id, cart);
  }
  async getByEmail(email) {
    return await this.usersDAO.getBy({ email });
  }

  async getById(_id) {
    return await this.usersDAO.getBy({ _id });
  }
}

export const userService = new UserService(new usersDAO());
