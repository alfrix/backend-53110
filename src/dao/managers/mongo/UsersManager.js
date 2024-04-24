import { usersModel } from "../../models/users.model.js";
import CartManager from './CartManager.js'



const admin = {
    _id: 0,
    first_name: "Admin",
    last_name: "Coder",
    email: "adminCoder@coder.com",
    password: "$2b$10$3RczyzSqgKpRgjebXDtcoeYCsQzgD3O.vdeALJ5HGZAkQx988OA1y",
    rol: "admin",
}

class usersManager {
    async create(user){
        if (user._id) {
            delete user._id
        }
        user.rol = "user"
        console.log("Agregando usuario")
        try {
            let user_db = await usersModel.create(user)
            user_db = user_db.toJSON()

            console.log("Asignando carrito al usuario")
            const cman = new CartManager();
            const cart = await cman.addCart()
            console.log(cart)
            await usersModel.updateOne({_id: user_db._id}, { cart })
            return { ...user_db, cart }

        } catch (error) {
            console.log(`Error creando usuario: ${error}`)
            return { error };
        }
    }

    async getUserById(uid) {
        if (uid === 0) {
            return admin
        }
        try {
            return await usersModel.findById(uid).lean()
        } catch (error) {
            console.log(`Error obteniendo usuario: ${error}`)
            return {status: 500, json: [{error: error}]}
        }
    }

    async getUserByEmail(email) {
        console.log("getUserByEmail", email)
        if (email === "adminCoder@coder.com") {
            return admin
        }
        try {
            return await usersModel.findOne({email}).lean()
        } catch (error) {
            console.log(`Error obteniendo usuario: ${error}`)
            return {status: 500, json: [{error: error}]}
        }
    }
}

export default usersManager
