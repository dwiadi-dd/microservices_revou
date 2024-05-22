import { Kafka } from "kafkajs";
import config from "../config";

const initKafka = ({ groupId }: { groupId: any }) => {
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
  const consumer = kafka.consumer({
    groupId,
    rebalanceTimeout: 30000,
    heartbeatInterval: 1500,
    sessionTimeout: 30000,
  });
  return { consumer };
};

export default initKafka;
