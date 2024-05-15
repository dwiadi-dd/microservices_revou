import * as amqp from "amqplib";
import { NotificationRepository } from "../repositories/notification-repository";

async function consumeFromQueue(
  queue: string,
  callback: (message: any) => void
) {
  const rabbitmqHost = process.env.RABBIT_HOST || "localhost";
  const rabbitmqUrl = `amqp://${rabbitmqHost}`;

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue);
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
}

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
export { consumeFromQueue, createNotification };
