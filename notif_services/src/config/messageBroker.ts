import * as amqp from "amqplib";

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

export { consumeFromQueue };
