import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { ProductController } from "./controllers/product-controller";
import { ProductService } from "./services/product-service";
import { ProductRepository } from "./repositories/product-repository";
import { mysqlConnection } from "./config/sqlConnection";
import { startQueueListener } from "./consumer/product-consumer";
import { TransactionHelper } from "./config/transaction";

const app = express();

const startServer = async () => {
  try {
    const sqlConnection = await mysqlConnection();

    const productRepository = new ProductRepository(sqlConnection);
    const transactionHelper = new TransactionHelper(sqlConnection);

    const productService = new ProductService(productRepository);
    const productController = new ProductController(productService);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));

    startQueueListener(productRepository, transactionHelper);

    app.get("/products", productController.getAll);
    app.post("/products", productController.create);
    app.delete("/products/:id", productController.delete);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
