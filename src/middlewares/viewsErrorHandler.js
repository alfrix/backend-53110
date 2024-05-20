export const viewsErrorHandler = (err, req, res, next) => {
  console.error("views /", err);

  const statusCode = err.statusCode || 500;
  let message = "Error interno del servidor";
  switch (statusCode) {
    case 404:
      message = "No encontrado";
      break;
    case 403:
      message = "No autorizado";
      break;
    case 401:
      return res.redirect("/login?error=Debe iniciar sesión");
    case 400:
      message = "Petición no valida";
      break;
  }

  let pageTitle = statusCode;
  return res.status(statusCode).render("error", {
    pageTitle,
    user: req.session.user,
    status: statusCode,
    message: message,
    error: err,
  });
};
