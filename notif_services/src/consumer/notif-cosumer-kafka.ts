import config from "../config/config";
import initKafka from "../config/kafka/config";
import { NotificationRepository } from "../repositories/notification-repository";

async function createNotificationKafka(
  notificationRepository: NotificationRepository
) {
  const groupId = "bangkit-notif-order-service";

  const { consumer } = initKafka({ groupId });
  await consumer.subscribe({
    topic: config.kafka_topic,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value?.toString() as string) as any;
      console.log({
        value: order,
        topic,
        partition,
      });

      try {
        if (
          order?.owner == "adi" &&
          order?.type == "create_order_notification"
        ) {
          const message = `Received new order: ${JSON.stringify(order)}`;
          notificationRepository.create(message);

          console.log("Kafka - Notification created for order:", message);
        }
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    },
  });
  await consumer.connect();
}

export { createNotificationKafka };
