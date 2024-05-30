import { connectToRabbitMQ, consumeFromQueue } from "../config/messageBroker";
import { NotificationRepository } from "../repositories/notification-repository";

async function createNotification(
  notificationRepository: NotificationRepository
) {
  const channel = await connectToRabbitMQ();

  consumeFromQueue(channel, "create-order", async (order: any) => {
    const message = `Received new order: ${JSON.stringify(order)}`;
    try {
      const orders = await notificationRepository.create(message);

      return {
        id: orders,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  });

  consumeFromQueue(channel, "paid-order", async (order: any) => {
    const message = `paid  order: ${JSON.stringify(order)}`;
    try {
      const orders = await notificationRepository.create(message);

      return {
        id: orders,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  });

  consumeFromQueue(channel, "cancel-order", async (order: any) => {
    const message = `cancel order: ${JSON.stringify(order)}`;
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
