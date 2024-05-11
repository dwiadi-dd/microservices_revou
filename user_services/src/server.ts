import express from "express";

import { mysqlConnection } from "./config/connection";

import { UserRepository } from "./repositories/user-repository";
import { UserService } from "./services/user-service";
import { UserController } from "./controllers/user-controller";
const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);

    app.use(express.json());
    app.post("/register", userController.register);
    app.post("/login", userController.login);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
