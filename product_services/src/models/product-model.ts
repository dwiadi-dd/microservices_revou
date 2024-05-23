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
export interface UpdateProductRequest {
  name: string;
  stocks: number;
  price: number;
}
export interface CheckStockRequest {
  items: CheckStockRequesItems[];
}

export interface CheckStockRequesItems {
  product_id: number;
  quantity: number;
}
export interface UpdateStockRequestKafka {
  order_id: string;
  items: CheckStockRequesItems[];
}

export interface UpdateStockRequest {
  order_id: string;
  product_id: string;
  quantity: number;
}

export interface RestoreStockRequest {
  product_id: string;
  quantity: number;
}

export interface CreateProductResponse {
  product_id: number;
}
