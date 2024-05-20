export interface OrderModel {
  order_id: string;
  user_id: number;
  status: string;
}

export interface CreateOrderRequest {
  order_id: string;
  user_id: number;
  items: OrderItemList[];
}

export interface CreateOrderRequestHead {
  order_id: string;
  user_id: number;
}
export interface OrderItemList {
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  order_id: string;
  product_id: number;
  quantity: number;
}

export interface CreateOrderResponse {
  order_id: string | null;
  message?: string;
}
