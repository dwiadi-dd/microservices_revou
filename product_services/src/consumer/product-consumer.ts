import {
  connectToRabbitMQ,
  consumeFromQueue,
  sendToQueue,
} from "../config/messageBroker";
import { TransactionHelper } from "../config/transaction";
import { ProductRepository } from "../repositories/product-repository";

async function updateStockListener(
  productRepository: ProductRepository,
  transactionHelper: TransactionHelper
) {
  const channel = await connectToRabbitMQ();
  consumeFromQueue(channel, "update-stock", async (msg: any) => {
    console.log("run update stock listener");
    const product = JSON.parse(msg.content.toString());

    const message = `Received order for product: ${JSON.stringify(product)}`;
    console.log(message);
    try {
      await transactionHelper.beginTransaction();
      console.log("Updating stock for product:", product);
      product?.items?.forEach(async (item: any) => {
        await productRepository.updateStock({
          product_id: item.product_id,
          order_id: product.order_id,
          quantity: item.quantity,
        });
      });

      await transactionHelper.commit();
      sendToQueue(channel, "create-order", {
        product,
      });
    } catch (error) {
      await transactionHelper.rollback();
      console.error("Error updating stock:", error);
    }
  });
}

async function restoreStockListener(
  productRepository: ProductRepository,
  transactionHelper: TransactionHelper
) {
  const channel = await connectToRabbitMQ();
  consumeFromQueue(channel, "restore-cancelled-item", async (msg: any) => {
    console.log("run restore stock listener");
    const product = JSON.parse(msg.content.toString());

    const message = `Received cancelled order for product: ${JSON.stringify(
      product
    )}`;
    console.log(message);
    try {
      await transactionHelper.beginTransaction();
      console.log("Restore stock for product:", product);
      product?.items?.forEach(async (item: any) => {
        await productRepository.restoreStock({
          product_id: item.product_id,
          quantity: item.quantity,
        });
      });
      const uniqueOrderIds = [
        ...new Set(product?.items?.map((item: any) => item.order_id)),
      ];

      uniqueOrderIds.forEach((order_Id) => {
        sendToQueue(channel, "cancel-order", {
          order_id: order_Id,
        });
      });

      await transactionHelper.commit();
    } catch (error) {
      await transactionHelper.rollback();
      console.error("Error updating stock:", error);
    }
  });
}

async function checkStockListener(
  productRepository: ProductRepository,
  transactionHelper: TransactionHelper
) {
  const channel = await connectToRabbitMQ();
  consumeFromQueue(channel, "check-stock", async (msg: any) => {
    const product = JSON.parse(msg.content.toString());
    const message = `check stock for product: ${JSON.stringify(product)}`;
    console.log(message);
    try {
      const stockAvailabilityPromises = product.map((item: any) =>
        productRepository.checkStocks(item)
      );
      const stockAvailability = await Promise.all(stockAvailabilityPromises);

      const isStockAvailableForAll = stockAvailability.every(Boolean);

      let response;
      if (!isStockAvailableForAll) {
        console.log("Stock not available for one or more products");
        response = {
          isStockAvailable: false,
        };
      } else {
        console.log("Stock available for all products");
        response = {
          isStockAvailable: true,
        };
      }

      // Send the response to the reply queue
      channel.sendToQueue(
        msg.properties.replyTo, // reply queue name
        Buffer.from(JSON.stringify(response)), // response message
        {
          correlationId: msg.properties.correlationId, // correlation ID of the original message
        }
      );
    } catch (error) {
      console.error("Error check stock", error);
    }
  });
}

async function startQueueListener(
  productRepository: ProductRepository,
  transactionHelper: TransactionHelper
) {
  await updateStockListener(productRepository, transactionHelper);
  await checkStockListener(productRepository, transactionHelper);
  await restoreStockListener(productRepository, transactionHelper);
}

export { startQueueListener };
