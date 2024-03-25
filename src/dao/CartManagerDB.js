import ProductManager from './ProductManagerDB.js'
import { cartsModel } from './models/carts.model.js'


class CartManager {

    async addCart() {
        let cid = await cartsModel.countDocuments()
        cid += 1
        let msg = `Agregando id: ${cid}`
        console.log(msg)
        let response = [{error:''}];
        try {
            const mongores = await cartsModel.create({id: cid, products: []})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 201, json: response}
    }

    async addProduct(cid, pid) {
        console.log(`Agregando producto ${pid} al carrito ${cid}`)
        const product = await this.validateProductById(pid);
        const cart = await this.getCartById(Number(cid));
        let msg = ""
        if (!cart || !product || isNaN(pid)) {
            if (!cart){
                msg = `Cart Id no valida: ${cid}`;
            } else {
                msg = `Product Id no valida: ${pid}`;
            }
            console.error(msg);
            return {status: 400, json: [{error: msg}]}
        }
        let quantity = 1;
        let response = [{error:''}];
        let exists = undefined
        let qty = 1
        if (cart.products.length > 0) {
            exists = cart.products.find(product => product.pid == pid);
        }
        if (exists) {
            msg = `Producto ${pid} existe en el carrito: ${cid} sumando 1 unidad`
            exists.quantity += qty
        } else {
            msg = `Producto ${pid} agregado al carrito: ${cid}`
            let p = { pid: pid, quantity: qty }
            cart.products.push(p)
        }
        console.log(msg)
        try {
            const mongores = await cartsModel.updateOne({id: cid}, {products: cart.products})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }

    async validateProductById(id){
        const pman = new ProductManager();
        return await pman.getProductById(id)
    }

    async getCartById(cid) {
        return await cartsModel.findOne({id: cid}).lean()
    }
}

export default CartManager