import { ticketsDAO } from "../dao/mongoDB/ticketsDAO.js";

class TicketService {
  constructor(dao) {
    this.ticketsDAO = dao;
  }
  async create(ticket) {
    try {
      const response = await this.ticketsDAO.create(ticket);
      if (!response) {
        throw new Error("Sin respuesta");
      }
      return response;
    } catch (error) {
      req.logger.error(`Error creando ticket`, error);
      throw new Error(`Fallo al crear ticket: ${error}`);
    }
  }

  async getById(_id) {
    try {
      const response = await this.ticketsDAO.getBy(_id);
      if (!response) {
        throw new Error(`No encontrado ${_id}`);
      }
      return response;
    } catch (error) {
      req.logger.error(`Error obteneniendo ticket`, error);
      throw new Error(`Fallo al obtener ticket: ${error}`);
    }
  }
}
export const ticketService = new TicketService(new ticketsDAO());
