import { Router } from "express"
import usersManager from '../dao/UsersMangerDB.js'
import { createHash, validatePass } from "../utils.js"

const router = Router()
const userMan = new usersManager()

router.post("/login", async(req, res) => {
    let {email, password} = req.body
    if (!email || !password) {
        return res.redirect("/login?error=Complete todos los campos")
    }
    let user;
    try {
        user = await userMan.getUserByEmail(email)
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
        // return res.status(500).json({error: "error inesperado"})
        return res.redirect('/login?error=Error inesperado')
    }

})

router.get("/logout", (req, res) => {
    console.log("logout")
    req.session.destroy(error => {
        if (error) {
            console.log(error)
            return res.redirect('/signup?error=Error inesperado')
            // return res.status(500).json({error: "error inesperado"})
        }
    })
    return res.redirect('/login?message=Sesión cerrada correctamente')
    // return res.status(200).json({payload: "sesion cerrada"})
})

router.post("/signup", async(req, res) => {
    console.log(`body: ${JSON.stringify(req.body)}`)

    let {firstName, lastName, email, password} = req.body
    if (!firstName || !lastName || !email || !password) {
        return res.redirect('/signup?error=Faltan Datos')
        // return res.status(400).json({error: "Faltan datos"})
    }

    try {
        const exists = await userMan.getUserByEmail(email)
        if (exists) {
            return res.redirect('/signup?error=Email ya registrado')
            // return res.status(400).json({error: "email ya registrado"})
        }
    } catch (error) {
        console.log(error)
        return res.redirect('/signup?error=Error inesperado')
    }
    password = createHash(password)
    try {
        const newUser = await userMan.create({first_name: firstName, last_name: lastName, email, password})
        // return res.status(200).json({payload: "Registrado", newUser})
        return res.redirect(`/login?message=Registrado: ${email}&email=${email}`)
    } catch (error) {
        console.log(error)
        return res.redirect('/signup?error=Error inesperado')
        // return res.status(500).json({error: "error inesperado"})
    }
})

export { router };
