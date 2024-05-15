import { sendToQueue } from "../config/messageBroker";
import { TransactionHelper } from "../config/transaction";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderModel,
} from "../models/order-model";
import { OrderRepository } from "../repositories/order-repository";

export class OrderService {
  private orderRepository: OrderRepository;
  private transactionHelper: TransactionHelper;

  constructor({
    orderRepository,
    transactionHelper,
  }: {
    orderRepository: OrderRepository;
    transactionHelper: TransactionHelper;
  }) {
    this.orderRepository = orderRepository;
    this.transactionHelper = transactionHelper;
  }

  async create(
    createOrderRequest: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    try {
      await this.transactionHelper.beginTransaction();
      const orderId = await this.generateOrderId();
      await this.orderRepository.create({
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
      });

      createOrderRequest.items.forEach(async (item) => {
        await this.orderRepository.addOrderedProductItem({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      });
      console.log({
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
        items: createOrderRequest.items,
      });
      sendToQueue("create-order", {
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
        items: createOrderRequest.items,
      });

      // sendToQueue("update-product-stocks", {
      //   order_id: orderId,
      //   user_id: createOrderRequest?.user_id,
      //   items: createOrderRequest.items,
      // });
      await this.transactionHelper.commit();

      return {
        order_id: orderId,
      };
    } catch (e) {
      await this.transactionHelper.rollback();
      throw e;
    }
  }

  async generateOrderId(): Promise<string> {
    const latestOrderId = await this.orderRepository.getLatestOrderId();
    const latestOrderNumber = latestOrderId
      ? parseInt(latestOrderId.replace("ADI", ""))
      : 0;
    const newOrderNumber = latestOrderNumber + 1;
    return "ADI" + String(newOrderNumber).padStart(6, "0");
  }
}
