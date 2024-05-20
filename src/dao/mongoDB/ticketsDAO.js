import { ticketsModel } from "../models/ticket.model.js";

export class ticketsDAO {
  async create(ticket) {
    try {
      return await ticketsModel.create(ticket);
    } catch (error) {
      console.error(`Error creando ticket`, error);
      throw new Error("Fallo al crear ticket");
    }
  }
  async getById(_id) {
    try {
      return await ticketsModel.findById(_id).lean();
    } catch (error) {
      console.error(`Error obteneniendo ticket`, error);
      throw new Error("Fallo al obtener ticket");
    }
  }
}
