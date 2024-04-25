import ProductManager from './ProductManager.js'
import { cartsModel } from '../../models/carts.model.js'

class CartManager {

    async addCart() {
        try{
            console.log("Agregando carrito")
            const mongores = await cartsModel.create({products: [], totalPrice: 0})
            return mongores.toJSON()
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async addProduct(cid, pid) {
        console.log(`Agregando producto ${pid} al carrito ${cid}`)
        try {
            const product = await this.validateProductById(pid);
            const cart = await this.getCartById(cid);
            let msg = ""
            if (!cart || !product) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Product Id no valida: ${pid}`;
                }
                console.error(msg);
                return {status: 400, json: {error: msg}}
            }
            console.log(`Producto es ${JSON.stringify(product)}`)
            let exists = undefined
            if (cart.products.length > 0) {
                exists = cart.products.find(product => product.product._id.equals(pid));
            }
            let qty = 1
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
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
            let response = [];
            const mongores = await cartsModel.updateOne({_id: cid}, {products: cart.products, totalPrice: total})
            response.push(await this.getCartById(cid))
            response.push(mongores)
            return {status: 200, json: {...response}}
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async validateProductById(id){
        console.log("validateProductById")
        const pman = new ProductManager();
        try {
            return await pman.getProductById(id)
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async getCartById(cid) {
        console.log("getCartById")
        try {
            return await cartsModel.findOne({_id: cid}).lean().populate("products.product")
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async emptyCart(cid) {
        console.log("emptyCart")
        try {
            const response = await cartsModel.updateOne({_id: cid}, {products: []})
            return {status: 200, json: response}
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async removeProductfromCart(cid, pid) {
        console.log("removeProductfromCart")
        try {
            const product = await this.validateProductById(pid);
            const cart = await this.getCartById(cid);
            let msg = ""
            if (!cart || !product) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Product Id no valida: ${pid}`;
                }
                console.error(msg);
                return {status: 400, json: {error: msg}}
            }
            let exists = undefined
            let qty = 1
            if (cart.products.length > 0) {
                exists = cart.products.find(product => product.product._id.equals(pid));
            }
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
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
            const mongores = await cartsModel.updateOne({_id: cid}, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await this.getCartById(cid))
            response.push(mongores)
            return {status: 200, json: {...response}}
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async updateCartProduct(cid, pid, updatedProduct) {
        console.log("updateCartProduct")
        try {
            const product = await this.validateProductById(pid);
            const cart = await this.getCartById(cid);
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
            let exists = undefined
            if (cart.products.length > 0) {
                exists = cart.products.find(product => product.product._id.equals(pid));
            }
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
                if (!updatedProduct.quantity || isNaN(updatedProduct.quantity)) {
                    return {status: 400, json: {error: 'Product quantity not provided, send {"quantity": Number}'}}    
                }
                cart.products[index].quantity = updatedProduct.quantity
                cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
            } else {
                return {status: 400, json: {error: "Product not in cart"}}
            }
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
            const mongores = await cartsModel.updateOne({_id: cid}, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await this.getCartById(cid))
            response.push(mongores)
            return {status: 200, json: {...response}}
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }

    async updateCart(cid, body) {
        console.log("updateCart")
        try {
            const cart = await this.getCartById(cid);
            let msg = ""
            if (!cart || !body.products || !Array.isArray(body.products)) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Products no validos: ${JSON.stringify(body)}`;
                }
                console.error(msg);
                return {status: 400, json: {error: msg}}
            }
            body.products.forEach(
                async (product) => {
                    try{
                        await this.validateProductById(product);
                    } catch (error) {
                        console.error(error)
                        return {status: 500, json: {error: "error inesperado"}}
                    }
                }
            )
            cart.products = body.products
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal), console.log(total)})
            const mongores = await cartsModel.updateOne({_id: cid}, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await this.getCartById(cid))
            response.push(mongores)
            return {status: 200, json: {...response}}
        } catch (error) {
            console.error(error)
            return {status: 500, json: {error: "error inesperado"}}
        }
    }
}

export default CartManager