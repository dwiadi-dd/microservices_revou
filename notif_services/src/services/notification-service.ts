import {
  CreateNotifRequest,
  CreateNotifResponse,
} from "../models/notification-model";
import { NotificationRepository } from "../repositories/notification-repository";

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async create(
    createNotificationRequest: CreateNotifRequest
  ): Promise<CreateNotifResponse> {
    const createdOrderId = await this.notificationRepository.create({
      message: createNotificationRequest.message,
    });

    return {
      id: createdOrderId,
    };
  }
}
