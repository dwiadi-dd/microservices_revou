import mysql from "mysql2";
import {
  CreateOrderRequest,
  CreateOrderRequestHead,
  OrderItem,
  OrderModel,
} from "../models/order-model";

export class OrderRepository {
  private db: mysql.Pool;
  private connection: mysql.PoolConnection | null = null;

  constructor(db: mysql.Pool) {
    this.db = db;
  }

  beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          this.connection = connection;
          resolve();
        });
      });
    });
  }

  commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("No active transaction"));
        return;
      }

      this.connection.commit((err) => {
        if (err) {
          reject(err);
          return;
        }

        if (this.connection) {
          this.connection.release();
          this.connection = null;
        }

        resolve();
      });
    });
  }

  rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("something wrong"));
        return;
      }

      this.connection.rollback(() => {
        if (this.connection) {
          this.connection.release();
          this.connection = null;
        }

        resolve();
      });
    });
  }
  create(createOrderRequestHead: CreateOrderRequestHead): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      console.log(createOrderRequestHead);
      const q = `INSERT INTO orders(order_id, user_id, status) 
                values(?,?,'pending')`;
      console.log(q);
      this.db.query(
        q,
        [createOrderRequestHead.order_id, createOrderRequestHead.user_id],
        (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(rows.insertId);
        }
      );
    });
  }
  addOrderedProductItem(orderItem: OrderItem): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log(orderItem);
      const q = `INSERT INTO ordered_products(order_id, product_id, quantity) 
                values(?,?,?)`;
      console.log(q);
      this.db.query(
        q,
        [orderItem.order_id, orderItem.product_id, orderItem.quantity],
        (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        }
      );
    });
  }

  getLatestOrderId(): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const q = "SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1";

      this.db.query(q, (err: mysql.QueryError | null, rows: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows[0]?.order_id || null);
      });
    });
  }
}
