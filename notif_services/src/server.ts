import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { mysqlConnection } from "./config/connection";
import { NotificationRepository } from "./repositories/notification-repository";
import { listenForMessages } from "./consumer/notif-consumer";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const notificationRepository = new NotificationRepository(db);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));
    listenForMessages(notificationRepository);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
