import express from "express";
import { UserController } from "../controllers/user-controller";

export const userRoutes = (userController: UserController) => {
  const router = express.Router();

  router.post("/register", userController.register);
  router.post("/login", userController.login);

  return router;
};
