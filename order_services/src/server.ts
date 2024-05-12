import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { mysqlConnection } from "./config/connection";
import { OrderRepository } from "./repositories/order-repository";
import { OrderService } from "./services/order-service";
import { OrderController } from "./controllers/order-controller";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const orderRepository = new OrderRepository(db);
    const orderService = new OrderService(orderRepository);
    const orderController = new OrderController(orderService);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));

    // app.get("/products", orderController.getAll);
    app.post("/products", orderController.create);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
