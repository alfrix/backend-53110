import { ticketsModel } from "../models/ticket.model.js";

export class ticketsDAO {
  async create(ticket) {
    return await ticketsModel.create(ticket);
  }
  async getById(tid) {
    return await ticketsModel.findById(tid).lean();
  }
}
