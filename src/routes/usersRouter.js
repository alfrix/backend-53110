import { Router } from "express";
import { setJsonResponse } from "../middlewares/jsonResponse.js";
import usersController from "../controllers/usersController.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use(setJsonResponse);

router.get("/", auth(["admin"]), async (req, res, next) => {
  const users = await usersController.getAll();
  return res.status(200).json(users);
});

router.delete("/", auth(["admin"]), async (req, res, next) => {
  const users = await usersController.deleteInactive();
  return res.status(200).json(users);
});

router.get("/premium/:uid", auth(["admin"]), async (req, res, next) => {
  const user = await usersController.togglePremium(req, res, next);
  return res.status(200).json(user);
});

router.post(
  "/:uid/documents",
  auth(["user", "premium", "admin"]),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'ident', maxCount: 1 },
    { name: 'comDomicilio', maxCount: 1 },
    { name: 'comCuenta', maxCount: 1 }
  ]),
  async (req, res, next) => {
    const doc = await usersController.addDocument(req, res, next);
    return res.status(201).json(doc);
  }
);

export { router };
