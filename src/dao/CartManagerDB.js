import ProductManager from './ProductManagerDB.js'
import { cartsModel } from './models/carts.model.js'


class CartManager {

    async addCart() {
        cart.id = cartsModel.countDocuments()
        cart.id += 1
        return await cartsModel.create({id: id, products: []})
    }

    async addProduct(cid, pid) {
        let product = await this.validateProductById(pid);
        let cart = await this.getCartById(Number(cid));
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
        // TODO: find pid en products y si esta sumarle qty
        return await cartsModel.updateOne({id: cid}, {products: [{pid: pid, quantity: quantity}]})
    }

    async validateProductById(id){
        const pman = new ProductManager();
        return await pman.getProductById(id)
    }

    async getCartById(id) {
        return await productsModel.findOne({id: id}).lean()
    }
}

export default CartManager