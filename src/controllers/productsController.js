import { productService } from "../services/Products.service.js";

export default class productsController {
  static addProduct = async (req, res, next) => {
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    req.logger.debug("Agregando producto");
    const newProduct = await productService.create(product);
    req.io.emit("newProduct", newProduct);
    return newProduct;
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
    let { limit, page, query, sort = "" } = req.query;
    if (!query) {
      query = {};
    } else {
      try {
        req.logger.debug(query);
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
      if (sort) req.logger.error(`sort not valid ${sort}`);
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
    } = await productService.paginate(query, options);
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
  };

  static getProductById = async (req, res, next) => {
    let { pid } = req.params;
    return await productService.getById(pid);
  };

  static updateProduct = async (req, res, next) => {
    let { pid } = req.params;
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    const oldProduct = await productService.getById(pid);
    if (!oldProduct || !product) {
      const error = new Error(
        `updateProduct: No se puede actualizar id: ${pid} datos: ${oldProduct} ${product}`
      );
      error.statusCode = 404;
      throw error;
    }
    const response = await productService.update(pid, product);
    req.io.emit("updateProduct", response);
    return response;
  };

  static deleteProduct = async (req, res, next) => {
    let { pid } = req.params;
    req.logger.debug(`Borrando id: ${pid}`);
    const oldProduct = await productService.getById(pid);
    if (!oldProduct) {
      let error = new Error(`deleteProduct: No se puede borrar id: ${pid}`);
      error.statusCode = 404;
      throw error;
    }
    const response = await productService.delete(pid);
    if (!response) {
      let error = new Error(`deleteProduct: No se puede borrar id: ${pid}`);
      error.statusCode = 500;
      throw error;
    }
    req.io.emit("deleteProduct", response);
    return response;
  };
}
