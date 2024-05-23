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
import { connectKafka } from "./config/kafka/config";
import { ProductConsumerKafka } from "./consumer/product-cosumer-kafka";
import { kafkaConsumers } from "./config/kafka/helper";

const app = express();

const startServer = async () => {
  try {
    const sqlConnection = await mysqlConnection();

    const productRepository = new ProductRepository(sqlConnection);
    const transactionHelper = new TransactionHelper(sqlConnection);

    const productService = new ProductService({
      productRepository,
      transactionHelper,
    });
    const productController = new ProductController(productService);
    const productConsumer = new ProductConsumerKafka(
      productRepository,
      transactionHelper
    );

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));
    await connectKafka();
    await kafkaConsumers(productConsumer);
    // startQueueListener(productRepository, transactionHelper);

    app.get("/products", productController.getAll);
    app.post("/products", productController.create);
    app.delete("/products/:id", productController.delete);
    app.post("/products/check", productController.checkStocks);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
