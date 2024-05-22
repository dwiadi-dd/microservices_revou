import { kafka } from "./clients";

export const kafkaConsumer = kafka.consumer({ groupId: "adi-order" });

export const orderConsumer = async () => {
  await kafkaConsumer.connect();

  await kafkaConsumer.subscribe({
    topic: "dxg-digicamp-microservices-test",
    fromBeginning: true,
  });

  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("kafkaConsumer", {
        value: message.value?.toString(),
      });
    },
  });
};
