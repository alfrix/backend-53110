import { isArray } from 'util';
import ProductManager from './ProductManagerDB.js'
import { cartsModel } from './models/carts.model.js'
import { ObjectId } from 'mongodb';
import { response } from 'express';

class CartManager {

    async addCart() {
        let cid = await cartsModel.countDocuments()
        cid += 1
        let msg = `Agregando id: ${cid}`
        console.log(msg)
        let response = [{error:''}];
        try {
            const mongores = await cartsModel.create({id: cid, products: [], totalPrice: 0})
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
        if (!cart || !product) {
            if (!cart){
                msg = `Cart Id no valida: ${cid}`;
            } else {
                msg = `Product Id no valida: ${pid}`;
            }
            console.error(msg);
            return {status: 400, json: [{error: msg}]}
        }
        console.log(`PRODUCTo es ${JSON.stringify(product)}`)
        let quantity = 1;
        let response = [{error:''}];
        let exists = undefined
        let qty = 1
        const pidObjectId = new ObjectId(pid);
        if (cart.products.length > 0) {
            exists = cart.products.find(product => product.product._id.equals(pidObjectId));
        }
        if (exists) {
            const index = cart.products.findIndex(product => product.product._id.equals(pidObjectId));
            msg = `Producto ${pid} existe en el carrito: ${cid} sumando 1 unidad`
            console.log(cart.products[index])
            cart.products[index].quantity += qty
            cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
        } else {
            msg = `Producto ${pid} agregado al carrito: ${cid}`
            let p = { product: pid, quantity: qty, productPriceTotal: product.price}
            cart.products.push(p)
        }
        console.log(msg)
        let total = 0;
        cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
        try {
            const mongores = await cartsModel.updateOne({id: cid}, {products: cart.products, totalPrice: total})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }

    async validateProductById(id){
        console.log("validateProductById")
        const pman = new ProductManager();
        return await pman.getProductById(id)
    }

    async getCartById(cid) {
        console.log("getCartById")
        return await cartsModel.findOne({id: cid}).lean().populate("products.product")
    }

    async emptyCart(cid) {
        console.log("emptyCart")
        const response = await cartsModel.updateOne({id: cid}, {products: []})
        return {status: 200, json: response}
    }

    async removeProductfromCart(cid, pid) {
        console.log("removeProductfromCart")
        const product = await this.validateProductById(pid);
        const cart = await this.getCartById(Number(cid));
        let msg = ""
        if (!cart || !product) {
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
        const pidObjectId = new ObjectId(pid);
        if (cart.products.length > 0) {
            exists = cart.products.find(product => product.product._id.equals(pidObjectId));
        }
        if (exists) {
            const index = cart.products.findIndex(product => product.product._id.equals(pidObjectId));
            msg = `Producto ${pid} existe en el carrito: ${cid} restando 1 unidad`
            console.log(cart.products[index])
            if (cart.products[index].quantity == 1){
                cart.products.splice(index, 1)
            } else {
                cart.products[index].quantity -= qty
                cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
            }
        }
        console.log(msg)
        let total = 0;
        cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
        try {
            const mongores = await cartsModel.updateOne({id: cid}, {products: cart.products, totalPrice: total})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }

    async updateCartProduct(cid, pid, updatedProduct) {
        console.log("updateCartProduct")
        const product = await this.validateProductById(pid);
        const cart = await this.getCartById(Number(cid));
        let msg = ""
        let response = [{error:''}];
        if (!cart || !product) {
            if (!cart){
                msg = `Cart Id no valida: ${cid}`;
            } else {
                msg = `Product Id no valida: ${pid}`;
            }
            console.error(msg);
            return {status: 400, json: [{error: msg}]}
        }
        let exists = undefined
        const pidObjectId = new ObjectId(pid);
        if (cart.products.length > 0) {
            exists = cart.products.find(product => product.product._id.equals(pidObjectId));
        }
        if (exists) {
            const index = cart.products.findIndex(product => product.product._id.equals(pidObjectId));
            if (!updatedProduct.quantity || isNaN(updatedProduct.quantity)) {
                return {status: 400, json: [{error: 'Product quantity not provided, send {"quantity": Number}'}]}    
            }
            cart.products[index].quantity = updatedProduct.quantity
            cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
        } else {
            return {status: 400, json: [{error: "Product not in cart"}]}
        }
        let total = 0;
        cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
        try {
            const mongores = await cartsModel.updateOne({id: cid}, {products: cart.products, totalPrice: total})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }

    async updateCart(cid, body) {
        console.log("updateCart")
        const cart = await this.getCartById(Number(cid));
        let msg = ""
        let response = [{error:''}];
        if (!cart || !body.products || !Array.isArray(body.products)) {
            if (!cart){
                msg = `Cart Id no valida: ${cid}`;
            } else {
                msg = `Products no validos: ${JSON.stringify(body)}`;
            }
            console.error(msg);
            return {status: 400, json: [{error: msg}]}
        }
        body.products.forEach(
            async (product) => {
                try{
                    await this.validateProductById(product);
                } catch (error) {
                    return {status: 500, json: [{error: error}]}
                }
            }
        )
        cart.products = body.products
        let total = 0;
        cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
        try {
            const mongores = await cartsModel.updateOne({id: cid}, {products: cart.products, totalPrice: total})
            response.push(await this.getCartById(cid))
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
        return {status: 200, json: response}
    }
}

export default CartManager