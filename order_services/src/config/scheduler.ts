import * as schedule from "node-schedule";
import { OrderRepository } from "../repositories/order-repository";

const updateServices =
  (orderRepository: OrderRepository) => async (): Promise<void> => {
    await Promise.all([orderRepository.cancelOrder()]);
  };

const scheduleJob = (
  orderRepository: OrderRepository,
  cronString: string
): void => {
  // Schedule the job to run at the specified frequency
  schedule.scheduleJob(cronString, updateServices(orderRepository));
};

export default scheduleJob;
