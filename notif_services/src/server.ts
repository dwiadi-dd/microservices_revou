import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { mysqlConnection } from "./config/connection";
import { NotificationRepository } from "./repositories/notification-repository";
import { createNotification } from "./consumer/notif-consumer";
import { connectKafka } from "./config/kafka/config";
import { kafkaConsumers } from "./config/kafka/helper";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const notificationRepository = new NotificationRepository(db);
    // await connectKafka();
    // await kafkaConsumers(notificationRepository);
    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));
    createNotification(notificationRepository);
    // createNotificationKafka(notificationRepository);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
