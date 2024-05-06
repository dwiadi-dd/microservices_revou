const { Kafka } = require("kafkajs");

async function run() {
  try {
    const kafka = new Kafka({
      clientId: "my-app",
      brokers: ["localhost:9092"], // Adjusted broker's IP and port
    });

    // Producer
    const producer = kafka.producer();
    console.log("Connecting producer...");
    await producer.connect();
    console.log("Producer connected.");
    const message = { value: "Hello, Kafka!" };
    await producer.send({
      topic: "bangkit-topic",
      messages: [message],
    });
    console.log("Message sent:", message);
    await producer.disconnect();
    console.log("Producer disconnected.");

    // Consumer
    const consumer = kafka.consumer({ groupId: "bangkit-group" });
    console.log("Connecting consumer...");
    await consumer.connect();
    console.log("Consumer connected.");
    await consumer.subscribe({ topic: "bangkit-topic", fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Received message:", {
          value: message.value.toString(),
          topic,
          partition,
        });
      },
    });

    // Disconnect consumer after 30 seconds
    setTimeout(async () => {
      console.log("Disconnecting consumer...");
      await consumer.disconnect();
      console.log("Consumer disconnected.");
    }, 30000);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

run();
