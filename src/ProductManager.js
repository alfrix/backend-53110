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
      "thumbnail",
      "code",
      "stock",
    ];

    for (let field of requiredFields) {
      if (!product[field]) {
        console.error(`Falta el campo: ${field}`);
        return;
      }
    }

    const exists = this.products.find((p) => p.code === product.code);
    if (exists) {
      console.error(`El codigo de producto ${product.code} ya existe`);
      return;
    }

    let id = 1;
    if (this.products.length > 0) {
      id = this.products[this.products.length - 1].id + 1;
    }
    product.id = id;
    this.products.push(product);
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
    console.log(`Producto agregado id: ${id}`)
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
    if (!oldProduct || !product || product.id) {
      console.error(`No se puede actualizar id: ${id}`);
      return;
    }
    console.log(`Actualizando producto id: ${id}`)
    const index = this.products.indexOf(oldProduct);
    this.products[index] = { ...this.products[index], ...product };
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
  }

  deleteProduct(id) {
    let product = this.getProductById(id);
    if (!product) {
      console.error(`No se puede borrar id: ${id} no encontrado`);
      return;
    }
    console.log(`Borrando id: ${id}`);
    const index = this.products.indexOf(product);
    this.products.splice(index, 1);
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
  }
}

export default ProductManager
