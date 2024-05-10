import express from "express";
import { NotificationService } from "../services/notification-service";
import { CreateNotifRequest } from "../models/notification-model";

export class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  create = async (req: express.Request, res: express.Response) => {
    try {
      const createNotifRequest = req.body as CreateNotifRequest;
      const createOrderResponse = await this.notificationService.create(
        createNotifRequest
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
}
