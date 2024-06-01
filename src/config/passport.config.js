import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { createHash, validatePass } from "../utils.js";
import usersController from "../controllers/usersController.js";

export const initPassport = () => {
  passport.use(
    "signup",
    new local.Strategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          let { firstName, lastName, email, age } = req.body;
          if (!firstName || !lastName || !email || !password) {
            return done(null, false, { message: "Faltan Datos" });
          }
          let user = await usersController.getUserByEmail(email);
          if (user) {
            return done(null, false, { message: "Email ya registrado" });
          }
          password = createHash(password);
          const newUser = await usersController.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            age,
          });
          return done(null, newUser);
        } catch (error) {
          req.logger.debug("error en el registro");
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          req.logger.debug(`login: ${username}`);
          let user = await usersController.getUserByEmail(username);
          if (!user) {
            req.logger.debug("not user");
            return done(null, false, { message: "Usuario inexistente" });
          }
          if (!validatePass(user, password)) {
            req.logger.debug("invalid pass");
            return done(null, false, { message: "Constraseña incorrecta" });
          }
          return done(null, user);
        } catch (error) {
          console.error("local-login", error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: "Iv1.b44f5a0a609d51e1",
        clientSecret: "fb6257d5483fdec19238e0283441d87c6f745081",
        callbackUrl: "http://localhost:8080/api/session/callbackGithub",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const first_name = profile._json.name;
          const last_name = profile._json.login;

          let email = profile._json.email;
          if (!email) {
            email = `${profile._json.id}+${profile._json.login}@users.noreply.github.com`;
          }
          let user = await usersController.getUserByEmail(email);
          if (!user) {
            req.logger.debug(`Nuevo usuario ${email}`);
            user = await usersController.create({
              first_name,
              last_name,
              email,
            });
          }
          return done(null, user);
        } catch (error) {
          console.error("github", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user.error) {
      req.logger.debug(`serialize-error: ${JSON.stringify(user.error)}`);
      return done(user.error);
    }
    if (!user._id) {
      req.logger.debug(`serialize-error-id: ${JSON.stringify(user._id)}`);
      return done(user);
    }
    return done(null, user._id);
  });

  passport.deserializeUser((user, done) => {
    if (user === -1) {
      user = usersController.getUserById(-1);
    }
    return done(null, user);
  });
};
