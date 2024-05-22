import mysql from "mysql2";
import {
  CreateOrderRequest,
  CreateOrderRequestHead,
  OrderItem,
  OrderModel,
} from "../models/order-model";
import { formatDateToMySQL, formatMysqlDatetime } from "../utils";

export class OrderRepository {
  private db: mysql.Pool;
  private connection: mysql.PoolConnection | null = null;

  constructor(db: mysql.Pool) {
    this.db = db;
  }
  create(createOrderRequestHead: CreateOrderRequestHead): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      console.log(createOrderRequestHead);
      const q = `INSERT INTO orders(order_id, user_id, status) 
                values(?,?,'unpaid')`;
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
  cancelOrderAndGetProducts(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const now = formatMysqlDatetime(new Date());
      console.log(now);
      const updateOrdersQuery = `
        UPDATE orders 
        SET status = 'cancelled', cancelled_at = ?
        WHERE DATE_ADD(order_date, INTERVAL 30 SECOND) <= ? 
        AND status = 'unpaid'
      `;
      this.db.query(
        updateOrdersQuery,
        [now, now],
        (err: mysql.QueryError | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (result.affectedRows === 0) {
            console.log("No orders were cancelled.");
          }

          const selectProductsQuery = `
            SELECT orders.order_id, ordered_products.product_id, ordered_products.quantity
            FROM orders
            JOIN ordered_products ON orders.order_id = ordered_products.order_id
            WHERE orders.status = 'cancelled' AND orders.cancelled_at = ?
          `;

          this.db.query(
            selectProductsQuery,
            [now],
            (err: mysql.QueryError | null, rows: any) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(rows);
            }
          );
        }
      );
    });
  }

  getCancelledOrderProducts(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const q = `
        SELECT orders.id as orderId, ordered_products.product_id as productId
        FROM orders 
        JOIN ordered_products ON orders.id = ordered_products.order_id
        WHERE orders.status = 'cancelled'
      `;

      this.db.query(q, (err: mysql.QueryError | null, rows: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
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
