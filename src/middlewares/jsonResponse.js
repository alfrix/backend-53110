export const setJsonResponse = async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  await next();
};
