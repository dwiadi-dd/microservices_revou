import express from "express";
import { mysqlConnection } from "./lib/database";
import { ProductController } from "./controllers/product-controller";
import { ProductService } from "./services/product-service";
import { ProductRepository } from "./repositories/product-repository";

const startServer = async () => {
  try {
    const db = await mysqlConnection();

    const productRepository = new ProductRepository(db);
    const productService = new ProductService(productRepository);
    const productController = new ProductController(productService);

    const app = express();

    app.use(express.json());

    app.get("/products", productController.getAll);
    app.post("/products", productController.create);

    app.listen(8082, () => {
      console.log("server is running on port 8082");
    });
  } catch (err) {
    console.error("failed to start server", err);
    process.exit(1);
  }
};

startServer();
