import express from "express";
import { ProductController } from "./controllers/product-controller";
import { ProductService } from "./services/product-service";
import { ProductRepository } from "./repositories/product-repository";
import { mysqlConnection } from "./config/connection";

const app = express();

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const productRepository = new ProductRepository(db);
    const productService = new ProductService(productRepository);
    const productController = new ProductController(productService);

    app.use(express.json());

    app.get("/products", productController.getAll);
    app.post("/products", productController.create);
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();

export default app;
