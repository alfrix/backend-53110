import { ticketsModel } from "../models/ticket.model.js";

export class ticketsDAO {
  async create(ticket) {
    return await ticketsModel.create(ticket);
  }
  async getById(_id) {
    return await ticketsModel.findById(_id).lean();
  }
}
