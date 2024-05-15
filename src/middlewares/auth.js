export const auth = (level) => {
  return (req, res, next) => {
    if (req.session.user) {
      delete req.session.user.password;
    }
    if (level === "public") {
      return next();
    }
    switch (level) {
      case "user":
        if (req.session.user) {
          return next();
        } else {
          console.log(`No autorizado`);
          return res.redirect("/login?error=Debe iniciar sesión");
        }
      case "admin":
        if (req.session.user && req.session.rol === "admin") {
          return next();
        } else {
          console.log(`No autorizado - Solo admin`);
          const error = new Error(`No autorizado`);
          error.statusCode = 401;
          return next(error);
        }
    }
  };
};
