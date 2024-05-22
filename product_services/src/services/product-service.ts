import {
  CheckStockRequest,
  CreateProductRequest,
  CreateProductResponse,
  GetProductResponse,
  ProductModel,
  UpdateProductRequest,
} from "../models/product-model";
import { ProductRepository } from "../repositories/product-repository";
export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async getAll(): Promise<GetProductResponse[]> {
    const products = await this.productRepository.getAll();

    let getProductsResponse: GetProductResponse[] = [];
    products.forEach((product) => {
      getProductsResponse.push({
        product_id: product?.product_id,
        stocks: product?.stocks,
        name: product?.name,
        price: product?.price,
      });
    });

    return getProductsResponse;
  }

  async create(
    createProductRequest: CreateProductRequest
  ): Promise<CreateProductResponse> {
    const createdProductId = await this.productRepository.create({
      product_id: 0,
      name: createProductRequest?.name,
      stocks: createProductRequest?.stocks,
      price: createProductRequest?.price,
    });
    return {
      product_id: createdProductId,
    };
  }

  async update(
    productId: number,
    updateProductRequest: UpdateProductRequest
  ): Promise<CreateProductResponse> {
    const updatedProduct = await this.productRepository.update({
      product_id: productId,
      name: updateProductRequest?.name,
      stocks: updateProductRequest?.stocks,
      price: updateProductRequest?.price,
    });

    return {
      product_id: productId,
    };
  }

  async delete(productId: number): Promise<void> {
    await this.productRepository.delete(productId);
  }

  async checkStocks(checkStockRequest: CheckStockRequest): Promise<boolean> {
    return await this.productRepository.checkStocks(checkStockRequest);
  }
}
