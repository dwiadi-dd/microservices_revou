import amqp from "amqplib/callback_api";

function sendToQueue(msg: string) {
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      const queue = "notificationQueue";

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
    });
  });
}

function onUserAction(msg: string) {
  sendToQueue(msg);
}

export { onUserAction, sendToQueue };
