import * as amqp from "amqplib";

async function connectToRabbitMQ() {
  const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
  const rabbitmqUrl = `amqp://${rabbitmqHost}`;
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  return channel;
}
async function consumeFromQueue(
  channel: amqp.Channel,
  queue: string,
  callback: (msg: any) => void
) {
  await channel.assertQueue(queue);
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      callback(msg);
      channel.ack(msg);
    }
  });
}

async function sendToQueue(
  channel: amqp.Channel,
  queue: string,
  message: any,
  options?: amqp.Options.Publish
) {
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options);
}

export { connectToRabbitMQ, consumeFromQueue, sendToQueue };
