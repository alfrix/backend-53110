import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/errorSignup", (req, res) => {
  console.error("errorSignup", req.session.messages);
  const messages = req.session.messages.join("\n");
  req.session.messages = [];
  return res.redirect(`/signup?error=Error al registrarse\n${messages}`);
});

router.get("/errorLogin", (req, res) => {
  console.error("errorLogin", req.session.messages);
  const messages = req.session.messages.join("\n");
  req.session.messages = [];
  return res.redirect(`/login?error=Error al iniciar sesion\n${messages}`);
});

router.get(
  "/github",
  passport.authenticate("github", {}, (req, res) => {})
);

router.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/api/session/errorLogin",
    failureMessage: true,
  }),
  (req, res) => {
    req.session.user = req.user;
    return res.redirect(`/?message=Bienvenido\n${req.user.first_name}`);
  }
);

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/session/errorLogin",
    failureMessage: true,
  }),
  async (req, res) => {
    let user = req.user;
    user = { ...user };
    delete user.password;
    console.log(user.email, "conectado");
    req.session.user = user;
    return res.redirect(`/?message=Bienvenido ${user.first_name}`);
  }
);

router.get("/logout", (req, res) => {
  console.log("logout");
  req.session.destroy((error) => {
    if (error) {
      console.log("logout", error);
      return res.redirect("/signup?error=Error inesperado");
    }
  });
  return res.redirect("/login?success=Sesión cerrada correctamente");
});

router.post(
  "/signup",
  passport.authenticate("signup", {
    failureRedirect: "/api/session/errorSignup",
    failureMessage: true,
  }),
  async (req, res) => {
    let { email } = req.body;
    return res.redirect(`/login?success=Registrado: ${email}&email=${email}`);
  }
);

export { router };
