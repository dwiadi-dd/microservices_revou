import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { mysqlConnection } from "./config/connection";
import { OrderRepository } from "./repositories/order-repository";
import { OrderService } from "./services/order-service";
import { OrderController } from "./controllers/order-controller";
import { authenticationMiddleware } from "./middlewares/middleware";
import { TransactionHelper } from "./config/transaction";
import { handleError } from "./utils";
import scheduleJob from "./config/scheduler";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const orderRepository = new OrderRepository(db);
    const transactionHelper = new TransactionHelper(db);
    const orderService = new OrderService({
      orderRepository,
      transactionHelper,
    });
    const orderController = new OrderController(orderService);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));
    app.use(authenticationMiddleware);
    app.post("/order", orderController.create);

    scheduleJob(orderService, "*/30 * * * * *");
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
