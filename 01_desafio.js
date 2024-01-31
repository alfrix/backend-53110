
// Consigna
// ✓ Realizar una clase “ProductManager” que
// gestione un conjunto de productos.

// Debe crearse desde su constructor con el
// elemento products, el cual será un arreglo vacío

// Cada producto que gestione debe
// contar con las propiedades:
// - title (nombre del producto)
// - description (descripción del
// producto)
// - price (precio)
// - thumbnail (ruta de imagen)
// - code (código identificador)
// - stock (número de piezas
// disponibles)

// Debe contar con un método
// “addProduct” el cual agregará un
// producto al arreglo de productos inicial.
// - Validar que no se repita el campo
// “code” y que todos los campos
// sean obligatorios
// - Al agregarlo, debe crearse con un
// id autoincrementable
// ✓ Debe contar con un método
// “getProducts” el cual debe devolver el
// arreglo con todos los productos
// creados hasta ese momento

// Debe contar con un método
// “getProductById” el cual debe buscar en
// el arreglo el producto que coincida con
// el id
// - En caso de no coincidir ningún id,
// mostrar en consola un error “Not
// found”

class ProductManager {
    constructor() {
      this.products = [];
    }
  
    addProduct(product) {
      if(!product.title) {
        console.error("Falta el titulo");
        return
      }
  
      if(!product.description) {
        console.error("Faltan la descripcion");
        return
      }

      if(!product.price) {
        console.error("Faltan el precio");
        return
      }

      if(!product.thumbnail) {
        console.error("Falta la thumbnail");
        return
      }
      if(!product.code) {
        console.error("Falta el codigo");
        return
      }
      if(!product.stock) {
        console.error("Falta cantidad de stock");
        return
      }

      const exists = this.products.find(p => p.code === product.code);
      if(exists) {
        console.error("El codigo de producto ya existe");
        return
      }
  
      // product.id = this.products.length + 1;
      let id = 1
      if (this.products.length > 0) {
        id = this.products[this.products.length - 1].id + 1
      }
      this.products.push(product);
    }
  
    getProducts() {
      return this.products;
    }
  
    getProductById(id) {
      const product = this.products.find(p => p.id === id);
      if(!product) {
        console.error("Not found");
        return;
      }
  
      return product;
    }
  }

  const manager = new ProductManager();

  const product = {
    title: "producto prueba",
    description: "Este es un producto prueba",
    price: 200,
    thumbnail: "Sin imagen", 
    code: "abc123",
    stock: 25
  };
  
  console.log(
    manager.getProducts()
    // Vacio
    )
    
  manager.addProduct(product);
  manager.addProduct(product);

  console.log(
    manager.getProducts()
    )