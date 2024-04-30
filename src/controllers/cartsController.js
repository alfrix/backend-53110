import { cartsDAO as cDAO } from '../dao/mongoDB/cartsDAO.js'
import { productsDAO as pDAO} from "../dao/mongoDB/productsDAO.js"

const productsDAO = new pDAO()
const cartsDAO = new cDAO()

export default class cartsController {

    static addCart=async(req,res)=>{
        try{
            console.log("Agregando carrito")
            const mongores = await cartsDAO.create({products: [], totalPrice: 0})
            return res.status(200).json(mongores.toJSON())
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static addProduct=async(req,res)=>{
        let {cid, pid} = req.params
        console.log(`Agregando producto ${pid} al carrito ${cid}`)
        try {
            const product = await productsDAO.findById(pid);
            const cart = await cartsDAO.findById(cid);
            let msg = ""
            if (!cart || !product) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Product Id no valida: ${pid}`;
                }
                console.error(msg);
                return res.status(400).json({error: msg})
            }
            console.log(cart)
            console.log(`Producto es ${JSON.stringify(product)}`)
            let exists = undefined
            console.log(`Carrito contiene ${cart.products.length} productos`)
            if (cart.products.length > 0) {
                console.log(`Productos: ${JSON.stringify(cart.products)}`)
                exists = cart.products.find((product) => product.product._id.equals(pid))
                };
            let qty = 1
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
                msg = `Producto ${pid} existe en el carrito: ${cid} sumando 1 unidad`
                cart.products[index].quantity += qty
                cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
            } else {
                msg = `Producto ${pid} agregado al carrito: ${cid}`
                let p = { product: pid, quantity: qty, productPriceTotal: product.price}
                cart.products.push(p)
            }
            console.log(msg)
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal)})
            let response = [];
            const mongores = await cartsDAO.updateOne(cid, {products: cart.products, totalPrice: total})
            response.push(await cartsDAO.findById(cid))
            response.push(mongores)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static getCartById=async(req,res)=>{
        let {cid} = req.params
        console.log("getCartById")
        try {
            const response = await cartsDAO.findById(cid)
            if (req.views) {
                return response
            }
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static emptyCart=async(req,res)=>{
        let {cid} = req.params
        console.log("emptyCart")
        try {
            const response = await cartsDAO.updateOne(cid)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static removeProductfromCart=async(req,res)=>{
        let {cid, pid} = req.params
        console.log("removeProductfromCart")
        try {
            const product = await productsDAO.findById(pid);
            const cart = await cartsDAO.findById(cid)
            let msg = ""
            if (!cart || !product) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Product Id no valida: ${pid}`;
                }
                console.error(msg);
                return res.status(400).json({error: msg})
            }
            let exists = undefined
            let qty = 1
            if (cart.products.length > 0) {
                exists = cart.products.find(product => product.product._id.equals(pid));
            }
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
                msg = `Producto ${pid} existe en el carrito: ${cid} restando 1 unidad`
                if (cart.products[index].quantity == 1){
                    console.log(`cantidad ${cart.products[index].quantity}`)
                    cart.products.splice(index, 1)
                } else {
                    cart.products[index].quantity -= qty
                    cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
                }
            }
            console.log(msg)
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal)})
            const mongores = await cartsDAO.updateOne(cid, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await cartsDAO.findById(cid))
            response.push(mongores)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static updateCartProduct=async(req,res)=>{
        let {cid, pid} = req.params
        let updatedProduct = req.body
        console.log("updateCartProduct")
        try {
            const product = await productsDAO.findById(pid);
            const cart = await cartsDAO.findById(cid)
            let msg = ""
            if (!cart || !product) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Product Id no valida: ${pid}`;
                }
                console.error(msg);
                return res.status(400).json({error: msg})
            }
            let exists = undefined
            if (cart.products.length > 0) {
                exists = cart.products.find(product => product.product._id.equals(pid));
            }
            if (exists) {
                const index = cart.products.findIndex(product => product.product._id.equals(pid));
                if (!updatedProduct.quantity || isNaN(updatedProduct.quantity)) {
                    return res.status(400).json({error: 'Product quantity not provided, send {"quantity": Number}'})
                }
                cart.products[index].quantity = updatedProduct.quantity
                cart.products[index].productPriceTotal = parseFloat(exists.product.price * cart.products[index].quantity).toFixed(2)
            } else {
                return res.status(400).json({error: "Product not in cart"})
            }
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal)})
            const mongores = await cartsDAO.updateOne(cid, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await cartsDAO.findById(cid))
            response.push(mongores)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }

    static updateCart=async(req,res)=>{
        let {cid} = req.params
        let products = req.body
        console.log("updateCart")
        try {
            const cart = await cartsDAO.findById(cid)
            let msg = ""
            if (!cart || !products || !Array.isArray(products)) {
                if (!cart){
                    msg = `Cart Id no valida: ${cid}`;
                } else {
                    msg = `Products no validos: ${JSON.stringify(products)}`;
                }
                console.error(msg);
                return res.status(400).json({error: msg})
            }
            products.forEach(
                async (product) => {
                    try{
                        await productsDAO.findById(product);
                    } catch (error) {
                        console.error(error)
                        return res.status(500).json({error: "error inesperado"})
                    }
                }
            )
            cart.products = products
            let total = 0;
            cart.products.map((product)=>{total += Number(product.productPriceTotal)})
            const mongores = await cartsDAO.updateOne(cid, {products: cart.products, totalPrice: total})
            let response = [];
            response.push(await cartsDAO.findById(cid))
            response.push(mongores)
            return res.status(200).json(response)
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: "error inesperado"})
        }
    }
}

