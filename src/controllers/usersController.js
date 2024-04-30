
const admin = {
    _id: -1,
    first_name: "Admin",
    last_name: "Coder",
    email: "adminCoder@coder.com",
    password: "$2b$10$3RczyzSqgKpRgjebXDtcoeYCsQzgD3O.vdeALJ5HGZAkQx988OA1y",
    rol: "admin",
}

import { cartsDAO as cDAO } from '../dao/mongoDB/cartsDAO.js'
import { usersDAO as uDAO} from "../dao/mongoDB/usersDAO.js"

const usersDAO = new uDAO()
const cartsDAO = new cDAO()

export default class usersController{
    static create=async(user)=>{
        if (user._id) {
            delete user._id
        }
        user.rol = "user"
        console.log("Agregando usuario")
        try {
            let user_db = await usersDAO.create(user)
            user_db = user_db.toJSON()

            console.log("Asignando carrito al usuario")
            const cart = await cartsDAO.addCart()
            console.log(cart)
            await usersDAO.updateOne({_id: user_db._id}, { cart })
            return { ...user_db, cart }
        } catch (error) {
            console.log(`Error creando usuario: ${error}`)
            return {error}
        }
    }

    static getUserById=async(uid)=>{
        if (uid === -1) {
            return admin
        }
        try {
            return await usersDAO.findById(uid)
        } catch (error) {
            console.error(`Error obteniendo usuario: ${error}`)
            return error
        }
    }

    static getUserByEmail=async(email)=>{
        console.log("getUserByEmail", email)
        if (email === "adminCoder@coder.com") {
            return admin
        }
        try {
            return await usersDAO.getUserByEmail(email)
        } catch (error) {
            console.error(`Error obteniendo usuario: ${error}`)
            return error
        }
    }
}
