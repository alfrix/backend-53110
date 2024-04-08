import { usersModel } from "../../models/users.model.js";


class usersManager {
    async create(user){
        if (user._id) {
            delete user._id
        }
        user.rol = "user"
        console.log("Agregando usuario")
        try {
            let response = [];
            const mongores = await usersModel.create(user)
            if (mongores.insertedId) {
                response.push(await this.getUserById(user._id))
            }
            response.push(mongores)
            return {status: 201, json: {...response}}
        } catch (error) {
            return {status: 500, json: {error}}
        }
    }

    async getUserById(uid) {
        try {
            return await usersModel.findById(uid).lean()
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
    }

    async getUserByEmail(email) {
        if (email === "adminCoder@coder.com") {
            return {
                first_name: "Admin",
                last_name: "Coder",
                email: "adminCoder@coder.com",
                password: "$2b$10$3RczyzSqgKpRgjebXDtcoeYCsQzgD3O.vdeALJ5HGZAkQx988OA1y",
                rol: "admin",
            }
        }
        try {
            return await usersModel.findOne({email}).lean()
        } catch (error) {
            return {status: 500, json: [{error: error}]}
        }
    }
}

export default usersManager
