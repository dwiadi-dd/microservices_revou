import mysql from "mysql2";
import { TransactionHelper } from "../config/transaction";
import { ProductRepository } from "../repositories/product-repository";
import {
  UpdateStockRequest,
  UpdateStockRequestKafka,
} from "../models/product-model";
import { publishMessageToQueue } from "../config/kafka/helper";
import config from "../config/config";

export class ProductConsumerKafka {
  private productRepository: ProductRepository;
  private transactionHelper: TransactionHelper;

  constructor(
    productRepository: ProductRepository,
    transactionHelper: TransactionHelper
  ) {
    this.productRepository = productRepository;
    this.transactionHelper = transactionHelper;
  }

  async update(updateProductRequest: UpdateStockRequestKafka): Promise<void> {
    try {
      await this.transactionHelper.beginTransaction();
      console.log("Updating stock for transaction:", updateProductRequest);
      updateProductRequest?.items?.forEach(async (item: any) => {
        await this.productRepository.updateStock({
          product_id: item.product_id,
          order_id: updateProductRequest.order_id,
          quantity: item.quantity,
        });
      });

      await this.transactionHelper.commit();
    } catch (error) {
      await this.transactionHelper.rollback();
      console.error("Error updating stock:", error);
    }
  }

  async restore(updateProductRequest: any): Promise<void> {
    try {
      await this.transactionHelper.beginTransaction();
      console.log("Restoring stock for transaction:", updateProductRequest);
      updateProductRequest?.items?.forEach(async (item: any) => {
        await this.productRepository.restoreStock({
          product_id: item.product_id,
          quantity: item.quantity,
        });
      });
      const uniqueOrderIds = [
        ...new Set(
          updateProductRequest?.items?.map((item: any) => item.order_id)
        ),
      ];

      uniqueOrderIds.forEach((order_Id) => {
        publishMessageToQueue({
          key: "BANGKIT-CANCEL_ORDER",
          owner: "bangkit",
          data: {
            order_Id,
          },
        });
      });
      await this.transactionHelper.commit();
    } catch (error) {
      await this.transactionHelper.rollback();

      console.error("Error updating stock:", error);
    }
  }
}
