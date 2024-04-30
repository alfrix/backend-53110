import { usersModel } from "../models/users.model.js";

export class usersDAO {

    async create(user) {
        return await usersModel.create(user)
    }

    async updateOne(_id, cart) {
        return await usersModel.updateOne({_id}, { cart })
    }

    async getUserByEmail(email){
        return await usersModel.findOne({email}).lean()
    }

    async getUserById(uid){
        return await usersModel.findById(uid).lean()
    }
    
}