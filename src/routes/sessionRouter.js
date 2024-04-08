import { Router } from "express"
import usersManager from '../dao/managers/mongo/UsersManager.js'
import { createHash, validatePass } from "../utils.js"

const router = Router()
const userMan = new usersManager()

router.post("/login", async(req, res) => {
    let {email, password} = req.body
    if (!email || !password) {
        return res.redirect("/login?error=Complete todos los campos")
    }
    try {
        let user = await userMan.getUserByEmail(email)
        if (!user) {
            return res.redirect("/login?error=Usuario desconocido")
        }
        if (!validatePass(user, password)) {
            return res.redirect("/login?error=Datos no validos")
        }
        user = {...user}
        delete user.password
        console.log(user.email, "conectado")
        req.session.user = user
        return res.redirect(`/?message=Bienvenido ${user.first_name}`)
    } catch (error) {
        console.log(error)
        return res.redirect('/login?error=Error inesperado')
    }

})

router.get("/logout", (req, res) => {
    console.log("logout")
    req.session.destroy(error => {
        if (error) {
            console.log(error)
            return res.redirect('/signup?error=Error inesperado')
        }
    })
    return res.redirect('/login?message=Sesión cerrada correctamente')
})

router.post("/signup", async(req, res) => {
    console.log(`body: ${JSON.stringify(req.body)}`)

    let {firstName, lastName, email, password} = req.body
    if (!firstName || !lastName || !email || !password) {
        return res.redirect('/signup?error=Faltan Datos')
    }
    try {
        const exists = await userMan.getUserByEmail(email)
        if (exists) {
            return res.redirect('/signup?error=Email ya registrado')
        }
        password = createHash(password)
        const newUser = await userMan.create({first_name: firstName, last_name: lastName, email, password})
        return res.redirect(`/login?message=Registrado: ${email}&email=${email}`)
    } catch (error) {
        console.log(error)
        return res.redirect('/signup?error=Error inesperado')
    }
})

export { router };
