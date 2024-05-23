import config from "../config";
import { producer, consumer } from "./config";
import { EachMessagePayload } from "kafkajs";

const publishMessageToQueue = async (
  topic: string = "dxg-digicamp-microservices-test",
  message: object | undefined
) => {
  producer.send({
    topic: topic,
    messages: [{ value: Buffer.from(JSON.stringify(message)) }],
  });
};

const kafkaConsumers = async () => {};

export { publishMessageToQueue, kafkaConsumers };
