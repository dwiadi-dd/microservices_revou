import * as schedule from "node-schedule";
import { OrderRepository } from "../repositories/order-repository";
import { OrderService } from "../services/order-service";

const updateServices =
  (orderService: OrderService) => async (): Promise<void> => {
    await Promise.all([orderService.cancelUnpaidOrders()]);
  };

const scheduleJob = (orderService: OrderService, cronString: string): void => {
  // Schedule the job to run at the specified frequency
  schedule.scheduleJob(cronString, updateServices(orderService));
};

export default scheduleJob;
