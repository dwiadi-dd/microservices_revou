import mysql from "mysql2";
import { OrderModel } from "../models/order-model";

export class OrderRepository {
  private db: mysql.Pool;

  constructor(db: mysql.Pool) {
    this.db = db;
  }

  create(orderModel: OrderModel): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const q = `INSERT INTO orders(user_id, product_id, price) 
                values(${orderModel.userId}, ${orderModel.productId}, ${orderModel.price})`;

      this.db.query(q, (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows.insertId);
      });
    });
  }
}
