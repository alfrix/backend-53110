import { Router } from "express";
import passport from "passport";
import { UserDTO } from "../dao/UserDTO.js";

const router = Router();

router.use((req, res) => {
  req.logger.info("Acceso a session");
});

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
    let user = req.user;
    user = { ...user };
    delete user.password;
    req.logger.debug(user.email, "conectado");
    req.session.user = user;
    return res.redirect(`/?message=Bienvenido\n${req.user.first_name}`);
  }
);

router.get("/current", (req, res) => {
  try {
    const user = req.session.user ? new UserDTO(req.session.user) : {};
    return res.status(200).json({ user });
  } catch (error) {
    console.error(`Error obteniendo usuario /current`, error);
    throw new Error(`Fallo al obtener usuario: ${error}`);
  }
});

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
    req.logger.debug(user.email, "conectado");
    req.session.user = user;
    return res.redirect(`/?message=Bienvenido ${user.first_name}`);
  }
);

router.get("/logout", (req, res) => {
  req.logger.debug("logout");
  req.session.destroy((error) => {
    if (error) {
      req.logger.debug("logout", error);
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
    try {
      let { email } = req.body;
      return res.redirect(`/login?success=Registrado: ${email}&email=${email}`);
    } catch (error) {
      return res.redirect(`/signup?error=Error al registrarse\n${error}`);
    }
  }
);

export { router };
