import express from "express";
import { stat } from "fs";
import { connectToRabbitMQ, sendToQueue } from "../config/messageBroker";
import { TransactionHelper } from "../config/transaction";
import { productAvailability } from "../consumer/order-consumer";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderModel,
} from "../models/order-model";
import { OrderRepository } from "../repositories/order-repository";
import { sendResponse } from "../utils";
import { v4 as uuidv4 } from "uuid";
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
      const channel = await connectToRabbitMQ();
      await this.transactionHelper.beginTransaction();
      const orderId = await this.generateOrderId();
      const replyToQueue = await channel.assertQueue(uuidv4(), {
        exclusive: false,
      });
      sendToQueue(channel, "check-stock", createOrderRequest.items, {
        replyTo: replyToQueue.queue,
      });
      const productAvailabile: any = await productAvailability(
        replyToQueue.queue
      );

      if (!productAvailabile.isStockAvailable) {
        await this.transactionHelper.rollback();
        return {
          order_id: "",
          message: "Product is not available",
        };
      }

      createOrderRequest.items.forEach(async (item) => {
        await this.orderRepository.addOrderedProductItem({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      });

      await this.orderRepository.create({
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
      });

      sendToQueue(channel, "create-order", {
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
        items: createOrderRequest.items,
      });

      sendToQueue(channel, "update-stock", {
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
        items: createOrderRequest.items,
      });

      await this.transactionHelper.commit();

      return {
        order_id: orderId,
        message:
          "order is being processed, please pay the order to complete it",
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
