import { usersModel } from "./models/users.model.js";


class usersManager {
    async create(user){
        if (user._id) {
            delete user._id
        }
        console.log("Agregando usuario")
        let response = [{error:''}];
        try {
            const mongores = await usersModel.create(user)
            if (mongores.insertedId) {
                response.push(await this.getUserById(user._id))
            }
            response.push(mongores)
        } catch (error) {
            return {status: 500, json: [{error}]}
        }
        return {status: 201, json: response}
    }

    async getUserById(uid) {
        let u = await usersModel.findById(uid).lean()
        console.log("getUserById", u)
        return u
    }

    async getUserByEmail(email) {
        let u = await usersModel.findOne({email}).lean()
        console.log("getUserByEmail", u)
        return u
    }
}

export default usersManager
