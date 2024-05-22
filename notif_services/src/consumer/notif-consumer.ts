import { connectToRabbitMQ, consumeFromQueue } from "../config/messageBroker";
import { NotificationRepository } from "../repositories/notification-repository";
import { kafkaConsumer } from "../config/kafka/consumer";

async function createNotification(
  notificationRepository: NotificationRepository
) {
  const channel = await connectToRabbitMQ();
  consumeFromQueue(channel, "create-order", async (order: any) => {
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
  consumeFromQueue(channel, "stock-update-failed", async (order: any) => {
    const message = `cancel order: ${JSON.stringify(order)}`;
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
