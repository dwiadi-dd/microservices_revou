import { kafka } from "./clients";

export const kafkaProducer = kafka.producer();

kafkaProducer.on("producer.connect", () => {
  console.log(`KafkaProvider: connected`);
});

kafkaProducer.on("producer.disconnect", () => {
  console.log(`KafkaProvider: could not connect`);
});

kafkaProducer.on("producer.network.request_timeout", (payload) => {
  // console.log(`KafkaProvider: request timeout ${payload}`);
});
