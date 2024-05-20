import { ticketsDAO } from "../dao/mongoDB/ticketsDAO.js";

class TicketService {
  constructor(dao) {
    this.ticketsDAO = dao;
  }
  async create(ticket) {
    return await this.ticketsDAO.create(ticket);
  }
  async getById(_id) {
    return await this.ticketsDAO.getBy(_id);
  }
}
export const ticketService = new TicketService(new ticketsDAO());
