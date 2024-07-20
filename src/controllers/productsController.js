import { logger } from "../middlewares/log.js";
import { productService } from "../services/Products.service.js";
import { userService } from "../services/Users.service.js"
import { sendEmail } from "../mailer.js";

export default class productsController {
  static addProduct = async (req, res, next) => {
    let product = req.body;
    if (product._id) {
      delete product._id;
    }
    if (!product["status"]) {
      product.status = true;
    }
    if (!product.thumbnails) {
      product.thumbnails = [];
    } else {
      product.thumbnails = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    if (!product["owner"]) {
      product.owner = "admin"
    } else {
      await userService.getByEmail(product.owner);
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
    let product = await productService.getById(pid);
    if (!product.owner) {
      product.owner = "admin"
    }
    logger.debug(product)
    return product
  };

  static updateProduct = async (req, res, next) => {
    let { pid } = req.params;
    let updatedProduct = req.body;
    const oldProduct = await productService.getById(pid);
    if (!oldProduct || !updatedProduct) {
      const error = new Error(
        `updateProduct: No se puede actualizar id: ${pid} datos: ${oldProduct} ${updatedProduct}`
      );
      error.statusCode = 404;
      throw error;
    }
    if (updatedProduct._id) {
      delete updatedProduct._id;
    }
    if (!updatedProduct.owner) {
      updatedProduct.owner = req.session.user.email
    }
    if (oldProduct.owner !== updatedProduct.owner && req.session.user.rol !== "admin") {
      const error = new Error(
        `updateProduct: No se puede actualizar ${pid}`
      );
      error.statusCode = 403;
      throw error;
    }
    const response = await productService.update(pid, updatedProduct);
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
    if (oldProduct.owner !== req.session.user.email && req.session.user.rol !== "admin") {
      const error = new Error(
        `deleteProduct: No se puede borrar ${pid}`
      );
      error.statusCode = 403;
      throw error;
    }
    const response = await productService.delete(pid);
    if (!response) {
      let error = new Error(`deleteProduct: No se puede borrar id: ${pid}`);
      error.statusCode = 500;
      throw error;
    }
    req.io.emit("deleteProduct", response);
    req.logger.info("Enviando correo informativo")
    let msg = `Atención se borró el producto ${oldProduct.title} (${oldProduct._id})`;
    await sendEmail(oldProduct.owner, "Producto borrado", msg);
    return response;
  };
}
