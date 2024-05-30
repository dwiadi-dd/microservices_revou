import { NotificationRepository } from "../../repositories/notification-repository";
import config from "../config";
import { producer, consumer } from "./config";
import { EachMessagePayload } from "kafkajs";

const publishMessageToQueue = async (message: object | undefined) => {
  producer.send({
    topic: config.kafka_topic,
    messages: [{ value: Buffer.from(JSON.stringify(message)) }],
  });
};

const kafkaConsumers = async (notificationRepository: NotificationRepository) =>
  // notificationRepository: NotificationRepository
  {
    await consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        try {
          const { data, owner, key } = JSON.parse(
            message.value?.toString() || ""
          );
          let notifMessage: string = "";

          if (owner == "bangkit" && data != null) {
            switch (key) {
              case "BANGKIT-CREATE_ORDER":
                notifMessage = `Received new order: ${JSON.stringify(data)}`;
                notificationRepository.create(notifMessage);
                break;
              case "BANGKIT-PAID_ORDER":
                notifMessage = `Order has been paid: ${JSON.stringify(data)}`;
                notificationRepository.create(notifMessage);
                break;
              case "BANGKIT-CANCEL_ORDER":
                notifMessage = `cancel order: ${JSON.stringify(data)}`;
                notificationRepository.create(notifMessage);

                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      },
    });
  };

export { publishMessageToQueue, kafkaConsumers };
