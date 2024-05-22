import { Kafka } from "kafkajs";
import config from "../config";
export const kafka = new Kafka({
  clientId: config.kafka_resource,
  brokers: [config.kafka_url],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: config.kafka_api_key,
    password: config.kafka_api_secret,
  },
});
