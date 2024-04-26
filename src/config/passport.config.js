import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { createHash, validatePass } from "../utils.js";
import usersManager from "../dao/managers/mongo/UsersManager.js";

const userMan = new usersManager();

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
          let user = await userMan.getUserByEmail(email);
          if (user) {
            return done(null, false, { message: "Email ya registrado" });
          }
          password = createHash(password);
          const newUser = await userMan.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            age,
          });
          return done(null, newUser);
        } catch (error) {
          console.log("error en el registro")
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
          console.log(`login: ${username}`);
          let user = await userMan.getUserByEmail(username);
          if (!user) {
            console.log("not user");
            return done(null, false, { message: "Usuario inexistente" });
          }
          if (!validatePass(user, password)) {
            console.log("invalid pass");
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
          let user = await userMan.getUserByEmail(email);
          if (!user) {
            console.log(`Nuevo usuario ${email}`);
            user = await userMan.create({ first_name, last_name, email });
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
      console.log(`serialize-error: ${JSON.stringify(user.error)}`)
      return done(user.error);
    }
    if (!user._id) {
      console.log(`serialize-error-id: ${JSON.stringify(user._id)}`)
      return done(user);
    }
    return done(null, user._id);
  });

  passport.deserializeUser((user, done) => {
    if (user === -1) {
      user = userMan.getUserById(-1);
    }
    return done(null, user);
  });
};
