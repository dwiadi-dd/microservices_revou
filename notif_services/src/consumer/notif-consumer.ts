import { consumeFromQueue } from "../config/messageBroker";
import { NotificationRepository } from "../repositories/notification-repository";

async function createNotification(
  notificationRepository: NotificationRepository
) {
  consumeFromQueue("create-order", async (order: any) => {
    const message = `Received new order: ${JSON.stringify(order)}`;
    console.log(message);
    try {
      const orders = await notificationRepository.create(message);

      return {
        id: orders,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  });
}
export { createNotification };
