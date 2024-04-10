import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/errorSignup", (req, res) => {
  console.error("errorSignup", req.session.messages);
  return res.redirect(`/signup?error=Error al registrarse\n${req.session.messages}`);
});

router.get("/errorLogin", (req, res) => {
  console.error("errorLogin", req.session.messages);
  return res.redirect(
    `/login?error=Error al iniciar sesion\n${req.session.messages}`
  );
});

router.get(
  "/github",
  passport.authenticate("github", {}, (req, res) => {})
);
router.get(
  "/callbackGithub",
  passport.authenticate(
    "github",
    {
      failureRedirect: "/login?message=Fallo al autenticar con Github",
      failureMessage: true,
    },
    (req, res) => {
      req.session.user = req.user;
      return res.status(200).json();
    }
  )
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
      console.log(error);
      return res.redirect("/signup?error=Error inesperado");
    }
  });
  return res.redirect("/login?message=Sesión cerrada correctamente");
});

router.post(
  "/signup",
  passport.authenticate("signup", {
    failureRedirect: "/api/session/errorSignup",
    failureMessage: true,
  }),
  async (req, res) => {
    console.log("##################");
    console.log(req);
    console.log("##################");
    console.log(res);
    console.log("##################");
    let { email } = req.body;
    return res.redirect(`/login?message=Registrado: ${email}&email=${email}`);
  }
);

export { router };
