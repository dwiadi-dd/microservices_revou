import mysql from "mysql2";
import { CheckStockRequest, ProductModel } from "../models/product-model";

export class ProductRepository {
  private db: mysql.Pool;

  constructor(db: mysql.Pool) {
    this.db = db;
  }

  getAll(): Promise<ProductModel[]> {
    return new Promise<ProductModel[]>((resolve, reject) => {
      const q = "SELECT * FROM products";
      this.db.query(
        q,
        (err: mysql.QueryError | null, rows: mysql.RowDataPacket) => {
          if (err) {
            reject(err);
            return;
          }

          let products: ProductModel[] = [];

          for (let i = 0; i < rows.length; i++) {
            products.push({
              product_id: rows[i].product_id,
              stocks: rows[i].stocks,
              name: rows[i].name,
              price: rows[i].price,
            });
          }

          resolve(products);
        }
      );
    });
  }

  create(productModel: ProductModel): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const q = "INSERT INTO products (name, stocks, price) VALUES (?, ?, ?)";
      this.db.query(
        q,
        [productModel.name, productModel.stocks, productModel.price],
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

  checkStocks(checkStockRequest: CheckStockRequest): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const query = `
      SELECT name, quantity 
      FROM products 
      WHERE id = ${checkStockRequest.product_id} AND quantity >= ${checkStockRequest.quantity};
    `;

      this.db.query(
        query,
        (err: mysql.QueryError | null, rows: mysql.RowDataPacket[]) => {
          if (err) {
            reject(err);
            return;
          }

          if (rows.length > 0) {
            resolve(true);
          } else {
            reject(new Error("product out of stock"));
            return;
          }
        }
      );
    });
  }

  updateStock(productModel: ProductModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const q = `UPDATE products p SET p.stocks = p.stocks - (SELECT op.quantity FROM ordered_products op WHERE op.product_id = ${productModel.product_id}) WHERE p.product_id = ${productModel.product_id}`;
      this.db.query(q, (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
