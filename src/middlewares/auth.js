export const auth=(req, res, next) => {
    if (!req.session.user){
        console.log(`No autorizado ${req}`)
        return res.redirect("/login?error=Debe iniciar sesión")
    }
    next()
}