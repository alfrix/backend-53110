import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { setJsonResponse } from "../middlewares/jsonResponse.js";
import { mockingProducts } from "../middlewares/mockingProducts.js";

const router = Router();

router.use((req, res) => {
  req.logger.info("Acceso a mocks");
});

router.use(setJsonResponse);

router.get("/", auth(["public"]), mockingProducts);

export { router };
