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
  callback: (message: any) => void
) {
  await channel.assertQueue(queue);
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
}

async function sendToQueue(channel: amqp.Channel, queue: string, message: any) {
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

export { connectToRabbitMQ, consumeFromQueue, sendToQueue };
