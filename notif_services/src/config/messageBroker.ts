import amqp from "amqplib/callback_api";
import { NotificationRepository } from "../repositories/notification-repository";

function listenForMessages(notificationRepository: NotificationRepository) {
  amqp.connect(
    `amqp://${process.env.RABBIT_HOST}`,
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        const queue = "notificationQueue";

        channel.assertQueue(queue, {
          durable: false,
        });

        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          queue
        );

        channel.consume(
          queue,
          async function (msg) {
            console.log(" [x] Received %s", msg?.content?.toString());
            const message = msg?.content?.toString();
            await notificationRepository.create(message as unknown as string);
          },
          {
            noAck: false,
          }
        );
      });
    }
  );
}

export { listenForMessages };
