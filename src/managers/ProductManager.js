import fs from 'fs'

class ProductManager {
  constructor(filepath) {
    this.path = filepath;
    if (fs.existsSync(filepath)) {
      console.log(`Cargando: ${filepath}`)
      this.products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    } else {
      this.products = [];
    }
  }

  addProduct(product) {
    const requiredFields = [
      "title",
      "description",
      "price",
      "code",
      "stock",
      "category",
      "status",
    ];

    if (!product['status']){
      this.status = true
    }

    for (let field of requiredFields) {
      if (!product[field]) {
        let msg = `Falta el campo: ${field}`
        console.error(msg);
        return {status: 400, json: [{error: msg}]}
      }
    }

    const exists = this.products.find((p) => p.code === product.code);
    if (exists) {
      let msg = `El codigo de producto ${product.code} ya existe`
      console.error(msg);
      return {status: 400, json: [{error: msg}]}
    }

    let id = 1;
    if (this.products.length > 0) {
      id = Math.max(...this.products.map(d=>d.id)) + 1
    }
    product.id = id;
    this.products.push(product);
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
    let msg = `Producto agregado id: ${id}`
    console.log(msg)
    return {status: 200, json: product}
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      console.error(`id: ${id} no encontrado`);
      return;
    }

    return product;
  }

  updateProduct(id, product) {
    let oldProduct = this.getProductById(id);
    console.log(oldProduct)
    if (!oldProduct || !product || product.id) {
      let msg = `No se puede actualizar id: ${id}`;
      console.error(msg);
      return {status: 400, json: [{error: msg}]}
    }
    const index = this.products.indexOf(oldProduct);
    this.products[index] = { ...this.products[index], ...product };
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
    let msg = `Actualizado producto id: ${id}`;
    console.error(msg);
    return {status: 200, json: this.products[index]}
  }

  deleteProduct(id) {
    let product = this.getProductById(id);
    if (!product) {
      let msg = `No se puede borrar id: ${id} no encontrado`
      console.error(msg);
      return {status: 404, json: [{error: msg}]}
    }
    const index = this.products.indexOf(product);
    this.products.splice(index, 1);
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
    let msg = `Borrado id: ${id}`
    console.log(msg);
    return {status: 200, json: product}
  }
}

export default ProductManager
