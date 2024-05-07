import { productsDAO as pDAO } from "../dao/mongoDB/productsDAO.js";

const productsDAO = new pDAO();

export default class productsController {
  static addProduct = async (req, res) => {
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    console.log("Agregando producto");
    try {
      let response = [];
      const mongores = await productsDAO.create(product);
      if (mongores.insertedId) {
        response.push(await productsDAO.findById(product._id));
      }
      response.push(mongores);
      req.io.emit("newProduct", response);
      return response;
    } catch (error) {
      console.error(`addProduct: ${error}`);
      throw error;
    }
  };

  /**
   *
   * @param {Number} req.limit per page
   * @param {Number} req.page
   * @param {Object} req.query { "title": "Sopa" }
   * @param {String} req.sort "asc" || "desc" (by price)
   * @returns
   */
  static getProducts = async (req, res) => {
    let { limit, page, query, sort } = req.query;
    if (!query) {
      query = {};
    } else {
      try {
        console.log(query);
        query = JSON.parse(query);
      } catch (error) {
        console.error(`getProducts: ${error}`);
        throw new Error(`Unable to parse JSON query ${query}: ${error}`);
      }
    }
    if (!sort || !["asc", "desc"].includes(sort)) {
      console.log(`sort not valid ${sort}`);
      sort = "asc";
    }
    !limit || isNaN(limit) || limit < 1
      ? (limit = 10)
      : (limit = Math.floor(limit));
    !page || isNaN(page) || page < 1 ? (page = 1) : (page = Math.floor(page));
    try {
      let options = {
        page: page,
        limit: limit,
        lean: true,
        sort: { price: sort },
      };

      let {
        docs: products,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage,
      } = await productsDAO.paginate(query, options);
      const response = {
        status: "success",
        payload: products,
        totalPages: totalPages,
        prevPage: prevPage,
        nextPage: nextPage,
        page: page,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
      };
      return response;
    } catch (error) {
      console.error(`getProducts: ${error}`);
      throw error;
    }
  };

  static getProductById = async (req, res) => {
    let { pid } = req.params;
    try {
      let response = await productsDAO.findById(pid);
      if (!product) {
        throw new Error(`No encontrado ${pid}`);
      }
      return response;
    } catch (error) {
      console.error(`getProductById: ${error}`);
      throw error;
    }
  };

  static updateProduct = async (req, res) => {
    let { pid } = req.params;
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    try {
      const oldProduct = await productsDAO.findById(pid);
      if (!oldProduct || !product) {
        throw new Error(
          `No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`
        );
      }
    } catch (error) {
      console.error(`updateProduct: ${error}`);
      return res.status(500).json({ error: "error inesperado" });
    }
    console.log(`Actualizando producto id: ${pid}`);
    try {
      let response = [];
      const mongores = await productsDAO.updateOne(pid, product);
      response.push(await productsDAO.findById(pid));
      response.push(mongores);
      req.io.emit("updateProduct", response);
      return response;
    } catch (error) {
      console.error(`updateProduct: ${error}`);
      throw error;
    }
  };

  static deleteProduct = async (req, res) => {
    let { pid } = req.params;
    console.log(`Borrando id: ${pid}`);
    try {
      let response = [];
      response.push(await productsDAO.findById(pid));
      response.push(await productsDAO.deleteOne(pid));
      req.io.emit("deleteProduct", response);
      return response;
    } catch (error) {
      console.error(`deleteProduct: ${error}`);
      throw error;
    }
  };
}
