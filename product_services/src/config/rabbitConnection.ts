import { Channel, Connection, connect } from "amqplib";
import config from "..//config/config";

let connection: Connection, channel: Channel;

const connectRabbitQueue = async () => {
  connection = await connect(config.rabbitmq_host as string);
  channel = await connection.createChannel();
  channel.prefetch(1);

  console.log(`RabbitMQ connected successfully`);
  await channel.assertQueue("product-availability-request");
};

export { connectRabbitQueue, connection, channel };
