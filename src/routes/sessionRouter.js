import { Router } from "express";
import passport from "passport";
import { UserDTO } from "../dao/UserDTO.js";
import { sendEmail } from "../mailer.js";
import { userService } from "../services/Users.service.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const router = Router();

router.use((req, res, next) => {
  req.logger.debug("Acceso a session");
  next()
});

router.get("/errorSignup", (req, res) => {
  req.logger.error("errorSignup", req.session.messages);
  const messages = req.session.messages.join("\n");
  req.session.messages = [];
  return res.redirect(`/signup?error=Error al registrarse\n${messages}`);
});

router.get("/errorLogin", (req, res) => {
  req.logger.error("errorLogin", req.session.messages);
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
    req.logger.error(`Error obteniendo usuario /current`, error);
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
      req.logger.error("logout", error);
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

router.post("/recovery", async (req, res) => {
  req.logger.debug("password recovery");
  let { email } = req.body;
  if (!email) {
    return res.redirect(`/login?message=Complete el correo electrónico`);
  }
  try {
    let user = await userService.getByEmail(email);
    if (!user) {
      return res.redirect(`/login?error=Email no válido`);
    }
    let token = jwt.sign({ _id: user._id, email: user.email }, config.SECRET, {
      expiresIn: "1h",
    });
    let url = `http://localhost:8080/recovery/${token}`;
    let msg = `Ha solicitado recuperar su contraseña. Si no fue usted, avise al administrador. Para continuar haga click <a href="${url}">aquí</a>.`;
    await sendEmail(email, "Recuperación de contraseña", msg);

    res.redirect("/login?message=Email de recuperación enviado");
  } catch (error) {
    req.logger.error("Error sending recovery email:", error.message);
    throw new Error(
      "Error inesperado - Intente más tarde o contacte al administrador"
    );
  }
});

router.post("/passwordChange/:token", async (req, res, next) => {
  req.logger.debug("password change");
  let { InputPassword1, InputPassword2 } = req.body;
  let { token } = req.params;

  if (!InputPassword1 || !InputPassword2 || InputPassword1 !== InputPassword2) {
    return res.redirect(
      `/recovery/${token}?error=Las contraseñas no coinciden`
    );
  }
  try {
    let decoded = jwt.verify(token, config.SECRET);
    await userService.update(decoded._id, { password: InputPassword1 });
    return res.redirect("/login?message=Contraseña cambiada exitosamente");
  } catch (error) {
    req.logger.error("Error changing password:", error);
    return res.redirect(
      `/recovery/${token}?error=Error al cambiar la contraseña`
    );
  }
});

export { router };
