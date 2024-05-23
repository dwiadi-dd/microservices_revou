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

          if (owner == "bangkit") {
            switch (key) {
              case "BANGKIT-CREATE_ORDER":
                notifMessage = `Received new order: ${JSON.stringify(data)}`;
                break;
              case "BANGKIT-PAID_ORDER":
                notifMessage = `Order has been paid: ${JSON.stringify(data)}`;
                break;
              default:
                break;
            }

            notificationRepository.create(notifMessage);
          }
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      },
    });
  };

// async function createNotificationKafka(
//   notificationRepository: NotificationRepository
// ) {
//   const groupId = "bangkit-notif-order-service";

//   const { consumer } = initKafka({ groupId });
//   await consumer.subscribe({
//     topic: config.kafka_topic,
//     fromBeginning: true,
//   });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       const order = JSON.parse(message.value?.toString() as string) as any;
//       console.log({
//         value: order,
//         topic,
//         partition,
//       });

//       try {
//         if (order?.owner == "bangkit" && order?.key == "BANGKIT-CREATE_ORDER") {
//           const message = `Received new order: ${JSON.stringify(order)}`;
//           notificationRepository.create(message);

//           console.log("Kafka - Notification created for order:", message);
//         }
//       } catch (error) {
//         console.error("Error creating notification:", error);
//       }
//     },
//   });
//   await consumer.connect();
// }

// export { createNotificationKafka };

export { publishMessageToQueue, kafkaConsumers };
