import express from "express";

import { mysqlConnection } from "./config/connection";
import { NotificationRepository } from "./repositories/notification-repository";
import { NotificationService } from "./services/notification-service";
import { NotificationController } from "./controllers/notification-controller";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const notificationRepository = new NotificationRepository(db);
    const notificationService = new NotificationService(notificationRepository);
    const notificationController = new NotificationController(
      notificationService
    );

    app.use(express.json());

    // app.get("/products", notificationController.getAll);
    app.post("/notification", notificationController.create);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
