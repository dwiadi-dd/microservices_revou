import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";

import { ProductController } from "./controllers/product-controller";
import { ProductService } from "./services/product-service";
import { ProductRepository } from "./repositories/product-repository";
import { mysqlConnection } from "./config/sqlConnection";

const app = express();

const startServer = async () => {
  try {
    const sqlConnection = await mysqlConnection();

    const productRepository = new ProductRepository(sqlConnection);
    const productService = new ProductService(productRepository);
    const productController = new ProductController(productService);

    app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));

    app.get("/products", productController.getAll);
    app.post("/products", productController.create);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
