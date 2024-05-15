import * as amqp from "amqplib";

async function sendToQueue(queue: string, message: any) {
  const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
  const rabbitmqUrl = `amqp://${rabbitmqHost}`;

  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

export { sendToQueue };
