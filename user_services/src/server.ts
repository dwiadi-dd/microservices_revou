import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { mysqlConnection } from "./config/connection";

import { UserRepository } from "./repositories/user-repository";
import { UserService } from "./services/user-service";
import { UserController } from "./controllers/user-controller";
import { userRoutes } from "./router/user-router";
const app = express();

const startServer = async () => {
  try {
    const sqlConnection = await mysqlConnection();
    const userRepository = new UserRepository(sqlConnection);
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));

    app.use("/user", userRoutes(userController));
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
