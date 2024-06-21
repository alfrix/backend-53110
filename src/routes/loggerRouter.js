import { Router } from "express";
import { setJsonResponse } from "../middlewares/jsonResponse.js";

const router = Router();

router.use(setJsonResponse);

router.get("/", (req, res) => {
  req.logger.debug("prueba log level debug");
  req.logger.http("prueba log level http");
  req.logger.info("prueba log level info");
  req.logger.warning("prueba log level warn");
  req.logger.error("prueba log level error");
  req.logger.fatal("prueba log level fatal");

  return res.status(200).json("Ok");
});

export { router };
