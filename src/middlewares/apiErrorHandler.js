export const apiErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (req) {
    req.logger.error(err.stack || err)
  }
  else {
    console.error(err.stack || err)
  }
  return res.status(statusCode).json({
    success: false,
    error: err.message,
  });
};
