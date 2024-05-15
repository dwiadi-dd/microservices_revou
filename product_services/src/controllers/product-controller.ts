import express from "express";
import { ProductService } from "../services/product-service";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../models/product-model";

export class ProductController {
  productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  getAll = async (req: express.Request, res: express.Response) => {
    try {
      const getProductsResponse = await this.productService.getAll();
      res.status(200).json({ data: getProductsResponse });
    } catch (err) {
      let errorMessage = "server error";
      if (err instanceof Error) errorMessage = err.message;
      console.error("failed to get products", err);
      res.status(500).json({ error: errorMessage });
    }
  };

  create = async (req: express.Request, res: express.Response) => {
    try {
      const createProductRequest = req.body as CreateProductRequest;
      const createProductResponse = await this.productService.create(
        createProductRequest
      );
      res.status(200).json({ data: createProductResponse });
    } catch (err) {
      let errorMessage = "server error";
      if (err instanceof Error) errorMessage = err.message;
      console.error("failed to get products", err);
      res.status(500).json({ error: errorMessage });
    }
  };

  update = async (req: express.Request, res: express.Response) => {
    try {
      const productId = Number(req.params.id); // Convert the productId from string to number
      const updateProductRequest = req.body as UpdateProductRequest;
      const updateProductResponse = await this.productService.update(
        productId,
        updateProductRequest
      );
      res.status(200).json({ data: updateProductResponse });
    } catch (err) {
      let errorMessage = "server error";
      if (err instanceof Error) errorMessage = err.message;
      console.error("failed to update product", err);
      res.status(500).json({ error: errorMessage });
    }
  };

  delete = async (req: express.Request, res: express.Response) => {
    try {
      const productId = Number(req.params.id);
      await this.productService.delete(productId);
      res
        .status(200)
        .json({ data: `product with id: ${productId} is deleted` });
    } catch (err) {
      let errorMessage = "server error";
      if (err instanceof Error) errorMessage = err.message;
      console.error("failed to delete product", err);
      res.status(500).json({ error: errorMessage });
    }
  };
}
