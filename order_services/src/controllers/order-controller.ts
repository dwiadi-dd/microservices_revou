import express from "express";
import { OrderService } from "../services/order-service";
import { CreateOrderRequest } from "../models/order-model";
import { sendResponse } from "../utils";

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  create = async (req: express.Request, res: express.Response) => {
    try {
      const createOrderRequest = req.body as CreateOrderRequest;
      createOrderRequest.user_id = req.app.locals.userId as number;
      const createOrderResponse = await this.orderService.create(
        createOrderRequest
      );
      res.status(200).json({
        data: createOrderResponse,
      });
    } catch (e) {
      let errorMessage = "server error";

      if (e instanceof Error) {
        errorMessage = e.message;
      }

      res.status(500).json({
        error: errorMessage,
      });
    }
  };

  createKafka = async (req: express.Request, res: express.Response) => {
    try {
      const createOrderRequest = req.body as CreateOrderRequest;
      createOrderRequest.user_id = req.app.locals.userId as number;
      const createOrderResponse = await this.orderService.createKafka(
        createOrderRequest
      );
      res.status(200).json({
        data: createOrderResponse,
      });
    } catch (e) {
      let errorMessage = "server error";

      if (e instanceof Error) {
        errorMessage = e.message;
      }

      res.status(500).json({
        error: errorMessage,
      });
    }
  };

  paid = async (req: express.Request, res: express.Response) => {
    try {
      const orderId = req.body.order_id;
      const userId = req.app.locals.userId as number;
      await this.orderService.paidOrderRabbit(orderId, userId);

      sendResponse(
        res,
        200,
        true,
        { order_id: orderId, message: "order paid successfully" },
        ""
      );
    } catch (e) {
      let errorMessage = "server error";

      if (e instanceof Error) {
        errorMessage = e.message;
      }

      res.status(500).json({
        error: errorMessage,
      });
    }
  };
}
