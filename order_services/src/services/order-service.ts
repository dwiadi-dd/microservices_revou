import {
  CreateOrderRequest,
  CreateOrderResponse,
  GetAllOrdersResponse,
} from "../models/order-model";
import { OrderRepository } from "../repositories/order-repository";

export class OrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async getAllByUserId(userId: number): Promise<GetAllOrdersResponse[]> {
    const orders = await this.orderRepository.getAllByUserId(userId);

    let getAllOrdersResponse: GetAllOrdersResponse[] = [];
    orders.forEach((order) => {
      getAllOrdersResponse.push({
        id: order.id,
        price: order.price,
        userId: order.userId,
        productId: order.productId,
      });
    });

    return getAllOrdersResponse;
  }

  async create(
    createOrderRequest: CreateOrderRequest,
    userId: number
  ): Promise<CreateOrderResponse> {
    const createdOrderId = await this.orderRepository.create({
      id: 0,
      userId: userId,
      productId: 1,
      price: createOrderRequest.price,
    });

    return {
      id: createdOrderId,
    };
  }
}
