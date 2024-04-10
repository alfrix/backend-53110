import passport from "passport"
import local from "passport-local"
import github from "passport-github2"
import { usersModel } from "../dao/models/users.model.js";
import { createHash, validatePass } from "../utils.js"
import usersManager from '../dao/managers/mongo/UsersManager.js'

const userMan = new usersManager()

export const initPassport = () => {
    passport.use(
        "signup",
        new local.Strategy(
            {
                usernameField:"email", 
                passReqToCallback: true
            },
            async (req, username, password, done) => {
                try {
                    let {firstName, lastName, email, password} = req.body
                    if (!firstName || !lastName || !email || !password) {
                        return done(null, false, { message: 'Faltan Datos' })
                    }
                    let user = await userMan.getUserByEmail(email)
                    if(user){
                        return done(null, false, { message: 'Email ya registrado' })
                    }
                    password = createHash(password)
                    const newUser = await userMan.create({first_name: firstName, last_name: lastName, email, password})
                    return done(null, newUser)            
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField: "email"
            },
            async (username, password, done) => {
                try {
                    console.log(username)
                    let user = await userMan.getUserByEmail(username)
                    if(!user){
                        console.log("not user")
                        return done(null, false, { message: 'Usuario inexistente' })
                    }
                    if (!validatePass(user, password)) {
                        console.log("invalid pass")
                        return done(null, false, { message: 'Constraseña incorrecta' })
                    }
                    return done(null, user)
                } catch (error) {
                    console.error(error)
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "github",
        new github.Strategy(
            {
                clientID:"Iv1.b44f5a0a609d51e1",
                clientSecret:"fb6257d5483fdec19238e0283441d87c6f745081",
                callbackUrl:"http://localhost:8080/api/session/callbackGithub",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const name = profile._json.name;
                    const email = profile._json.email;
                    let user = await usersModel.findOne({email})
                    if (!user) {
                        user = await usersModel.create({first_name: name, email})
                    }
                    return done(user)
                } catch (error) {
                    console.error(error)
                    return done(error)
                }
            }
        )
    )
    
    passport.serializeUser((user, done) => {
        return done(null, user)
    })

    passport.deserializeUser((user, done) => {
        return done(null, user)
    })
}