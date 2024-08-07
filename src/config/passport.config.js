import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { createHash, validatePass } from "../utils.js";
import usersController from "../controllers/usersController.js";
import { logger } from "../middlewares/log.js";

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
          req.logger.error("error en el registro");
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
          logger.debug(`login: ${username}`);
          let user = await usersController.getUserByEmail(username);
          if (!user) {
            logger.debug("not user");
            return done(null, false, { message: "Usuario inexistente" });
          }
          if (!validatePass(user, password)) {
            logger.debug("invalid pass");
            return done(null, false, { message: "Constraseña incorrecta" });
          }
          return done(null, user);
        } catch (error) {
          logger.error("local-login", error);
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
        clientSecret: process.env.GITHUB_KEY,
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
            logger.debug(`Nuevo usuario ${email}`);
            user = await usersController.create({
              first_name,
              last_name,
              email,
            });
          }
          return done(null, user);
        } catch (error) {
          logger.error("github", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user.error) {
      logger.error(`serialize-error: ${JSON.stringify(user.error)}`);
      return done(user.error);
    }
    if (!user._id) {
      logger.error(`serialize-error-id: ${JSON.stringify(user._id)}`);
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
