export interface OrderModel {
    id: number
    userId: number
    productId: number
    price: number
}

export interface CreateOrderRequest {
    productId: number
    price: number
}

export interface CreateOrderResponse {
    id: number
}

export interface GetAllOrdersResponse {
    id: number
    userId: number
    productId: number
    price: number
}