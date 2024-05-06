export interface ProductModel {
  product_id: number;
  name: string;
  stocks: number;
  price: number;
}

export interface GetProductResponse {
  product_id: number;
  name: string;
  stocks: number;
  price: number;
}

export interface CreateProductRequest {
  name: string;
  stocks: number;
  price: number;
}

export interface CreateProductResponse {
  product_id: number;
}
