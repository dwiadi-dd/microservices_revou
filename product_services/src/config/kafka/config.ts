import { Consumer, Kafka, Producer } from "kafkajs";
import config from "../../config/config";

const kafka = new Kafka({
  clientId: config.kafka_resource,
  brokers: [config.kafka_url],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: config.kafka_api_key,
    password: config.kafka_api_secret,
  },
});

let consumer: Consumer, producer: Producer;

const connectKafka = async () => {
  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: "bangkit-group-product" });

  await producer.connect();
  await consumer.connect();
  console.log(`Kafka connected successfully`);
  await consumer.subscribe({ topic: config.kafka_topic, fromBeginning: true });
};

export { connectKafka, consumer, producer };
