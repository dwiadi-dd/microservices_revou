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
import axios from "axios";
import config from "../config/config";
import { publishMessageToQueue } from "../config/kafka/helper";
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
        items: createOrderRequest?.items,
      });

      sendToQueue(channel, "update-stock", {
        order_id: orderId,
        user_id: createOrderRequest?.user_id,
        items: createOrderRequest?.items,
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

  async createKafka(
    createOrderRequest: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    try {
      const channel = await connectToRabbitMQ();
      await this.transactionHelper.beginTransaction();
      const orderId = await this.generateOrderId();

      const isStockAvailable = await axios
        .post(`${config.product_service_url}/products/check`, {
          items: createOrderRequest.items,
        })
        .then((response) => {
          return response?.data?.data?.isStockAvailable;
        })
        .catch((err) => {
          return false;
        });
      console.log(isStockAvailable, "isStockAvailable");
      if (!isStockAvailable) {
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

      publishMessageToQueue(config.kafka_topic, {
        key: "BANGKIT-CREATE_ORDER",
        owner: "bangkit",
        data: {
          order_id: orderId,
          details: createOrderRequest,
          status: "pending",
        },
      });

      publishMessageToQueue(config.kafka_topic, {
        key: "BANGKIT-UPDATE_STOCK",
        owner: "bangkit",
        data: {
          order_id: orderId,
          user_id: createOrderRequest?.user_id,
          items: createOrderRequest?.items,
        },
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

  async paidOrder(orderId: string, userId: number): Promise<string> {
    try {
      const orderDetails = await this.orderRepository.orderDetails(orderId);
      if (Number(orderDetails?.user_id) !== userId) {
        throw new Error("Unauthorized access to order details");
      }

      await this.orderRepository.paidOrder(orderId);

      publishMessageToQueue(config.kafka_topic, {
        key: "BANGKIT-PAID_ORDER",
        owner: "bangkit",
        data: {
          order_id: orderId,
          status: "paid",
        },
      });
      return orderId;
    } catch (e) {
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

  async cancelUnpaidOrders(): Promise<void> {
    try {
      const channel = await connectToRabbitMQ();

      const items = await this.orderRepository.cancelOrderAndGetProducts();
      console.log("items", items);
      sendToQueue(channel, "restore-cancelled-item", {
        items,
      });
    } catch (err) {
      console.error("An error occurred while cancelling unpaid orders:", err);
    }
  }
}
