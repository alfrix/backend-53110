export const auth = (accesos) => {
  return (req, res, next) => {
    if (!accesos || !Array.isArray(accesos)) {
      const error = new Error(`Accesos no definidos`);
      error.statusCode = 500;
      throw error;
    }

    if (accesos.includes("public")) {
      return next();
    } else if (!req.session.user) {
      console.log(`No autenticado`);
      const error = new Error(`No autenticado`);
      error.statusCode = 401;
      throw error;
    } else if (req.session.user.rol === "admin") {
      console.log(`Acceso admin`);
      return next();
    } else if (accesos.includes(req.session.user.rol)) {
      console.log(`Usuario autorizado rol: ${req.session.user.rol}`);
      return next();
    }
    console.log(`No autorizado: ${req.session.user.rol}`);
    const error = new Error(`No autorizado`);
    error.statusCode = 403;
    throw error;
  };
};
