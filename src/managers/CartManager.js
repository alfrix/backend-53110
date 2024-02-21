import fs from 'fs'

class CartManager {
    constructor(filepath) {
        this.path = filepath;
        if (fs.existsSync(filepath)) {
          console.log(`Cargando: ${filepath}`)
          this.carts = JSON.parse(fs.readFileSync(this.path, "utf-8"));
        } else {
          this.carts = [];
        }
    }

    addCart() {
        let id = 1;
        if (this.carts.length > 0) {
            id = Math.max(...this.carts.map(d=>d.id)) + 1
        }
        let cart = {id: id, products: []}
        this.carts.push(cart);
        fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
        let msg = `Carrito agregado id: ${id}`
        console.log(msg)
        return {status: 200, json: cart}
    }

    addProduct(cid, pid) {

        // TODO validar pid

        let qty = 1
        let cart = this.getCartById(Number(cid))
        if (!cart) {
            let msg = `Id de carrito no valida: ${cid}`
            console.error(msg);
            return {status: 400, json: [{error: msg}]}
        }
        let msg = undefined
        let exists = undefined
        if (cart.products.length > 0) {
            exists = cart.products.find(product => product.pid === pid);
        }
        if (exists) {
            msg = `Producto ${pid} existe en el carrito: ${cid} sumando 1 unidad`
            exists.quantity += qty
        } else {
            msg = `Producto ${pid} agregado al carrito: ${cid}`
            let product = { pid: pid, quantity: qty }
            cart.products.push(product)
        }
        const index = this.carts.indexOf(cart);
        this.carts[index] = { ...this.carts[index], ...cart };
        fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
        console.log(msg)
        return {status: 200, json: cart}
    }

    getCartById(id) {
        const cart = this.carts.find((c) => c.id === id);
        if (!cart) {
            console.error(`id: ${id} no encontrado`);
            return;
        }
        return cart;
    }
}

export default CartManager