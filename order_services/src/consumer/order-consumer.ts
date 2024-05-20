import {
  connectToRabbitMQ,
  consumeFromQueue,
  sendToQueue,
} from "../config/messageBroker";
import { OrderRepository } from "../repositories/order-repository";

async function productAvailability(queue: string) {
  const channel = await connectToRabbitMQ();

  return new Promise((resolve, reject) => {
    consumeFromQueue(channel, queue, (msg) => {
      if (msg !== null) {
        const productAvailability = JSON.parse(msg.content.toString());
        resolve(productAvailability);
      } else {
        reject(new Error("No message received from queue"));
      }
    });
  });
}
async function startQueueListener(orderRepository: OrderRepository) {
  // await handleFailedStockUpdateListener(orderRepository);
}

export { startQueueListener, productAvailability };
