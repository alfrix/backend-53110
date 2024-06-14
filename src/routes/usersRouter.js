import { Router } from "express";
import { setJsonResponse } from "../middlewares/jsonResponse.js";
import usersController from "../controllers/usersController.js";

const router = Router();

router.use(setJsonResponse);

router.get("/premium/:uid", auth(["admin"]), async (req, res, next) => {
    const user = await usersController.setAsPremium(req, res, next);
    return res.status(200).json(user);
  });

export { router };
