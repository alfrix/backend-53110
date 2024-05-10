import { productsDAO as pDAO } from "../dao/mongoDB/productsDAO.js";

const productsDAO = new pDAO();

export default class productsController {
  static addProduct = async (req, res, next) => {
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    console.log("Agregando producto");
    try {
      const res1 = await productsDAO.create(product);
      if (!res1) {
        throw new Error(`Error creando producto: ${JSON.stringify(product)}`);
      }
      let res2;
      if (res1.insertedId) {
        res2 = await productsDAO.findById(res1.insertedId);
        if (!res2) {
          throw new Error(`Error buscando producto: ${res1.insertedId}`);
        }
      }
      const response = [res2, res1];
      req.io.emit("newProduct", response);
      return response;
    } catch (error) {
      console.error(`addProduct`);
      next(error);
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
  static getProducts = async (req, res, next) => {
    try {
      let { limit, page, query, sort = "" } = req.query;
      if (!query) {
        query = {};
      } else {
        try {
          console.log(query);
          query = JSON.parse(query);
        } catch (error) {
          const err = new Error(`Unable to parse JSON query ${query} ${error}`);
          error.statusCode = 400;
          throw err;
        }
      }

      if (["asc", "desc"].includes(sort)) {
        sort = { price: sort };
      } else {
        if (sort) console.error(`sort not valid ${sort}`);
        sort = {};
      }

      !limit || isNaN(limit) || limit < 1
        ? (limit = 10)
        : (limit = Math.floor(limit));
      !page || isNaN(page) || page < 1 ? (page = 1) : (page = Math.floor(page));
      let options = {
        page,
        limit,
        lean: true,
        sort,
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
      console.error(`getProducts`);
      next(error);
    }
  };

  static getProductById = async (req, res, next) => {
    let { pid } = req.params;
    try {
      let response = await productsDAO.findById(pid);
      if (!response) {
        const error = new Error(`getProductById: No encontrado ${pid}`);
        error.statusCode = 404;
        throw error;
      }
      return response;
    } catch (error) {
      next(error);
    }
  };

  static updateProduct = async (req, res, next) => {
    let { pid } = req.params;
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    try {
      const oldProduct = await productsDAO.findById(pid);
      if (!oldProduct || !product) {
        const error = new Error(
          `updateProduct: No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`
        );
        error.statusCode = 404;
        throw error;
      }
      console.log(`Actualizando producto id: ${pid}`);
      const res1 = await productsDAO.updateOne(pid, product);
      if (!res1) {
        throw new Error(`Error actualizando producto: ${pid}`);
      }
      const res2 = await productsDAO.findById(pid);
      if (!res2) {
        throw new Error(`Error devolviendo producto: ${pid}`);
      }
      const response = [res2, res1];
      req.io.emit("updateProduct", response);
      return response;
    } catch (error) {
      console.error(`updateProduct`);
      next(error);
    }
  };

  static deleteProduct = async (req, res, next) => {
    let { pid } = req.params;
    console.log(`Borrando id: ${pid}`);
    try {
      const res1 = await productsDAO.findById(pid);
      if (!res1) {
        throw new Error(`Error actualizando producto: ${pid}`);
      }
      const res2 = await productsDAO.deleteOne(pid);
      if (!res2) {
        throw new Error(`Error devolviendo producto: ${pid}`);
      }
      const response = [res2, res1];
      req.io.emit("deleteProduct", response);
      return response;
    } catch (error) {
      console.error(`deleteProduct`);
      next(error);
    }
  };
}
