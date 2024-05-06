import mysql from "mysql2";
import { ProductModel } from "../models/product-model";

export class ProductRepository {
  private db: mysql.Connection;

  constructor(db: mysql.Connection) {
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
}
