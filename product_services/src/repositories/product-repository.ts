import mysql from "mysql2";
import {
  CheckStockRequesItems,
  CheckStockRequest,
  ProductModel,
  RestoreStockRequest,
  UpdateStockRequest,
} from "../models/product-model";

export class ProductRepository {
  private sqlConnection: mysql.Pool;

  constructor(sqlConnection: mysql.Pool) {
    this.sqlConnection = sqlConnection;
  }

  getAll(): Promise<ProductModel[]> {
    return new Promise<ProductModel[]>((resolve, reject) => {
      const q = "SELECT * FROM products";
      this.sqlConnection.query(
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
      this.sqlConnection.query(
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

  update(productModel: ProductModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const q = `UPDATE products SET name = ?, stocks = ?, price = ? WHERE product_id = ?`;
      this.sqlConnection.query(
        q,
        [
          productModel.name,
          productModel.stocks,
          productModel.price,
          productModel.product_id,
        ],
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

  delete(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const q = `DELETE FROM products WHERE product_id = ?`;
      this.sqlConnection.query(
        q,
        [id],
        (err: mysql.QueryError | null, rows: mysql.ResultSetHeader) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  checkStocks(checkStockRequest: CheckStockRequesItems): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const query = `
      SELECT name, stocks 
      FROM products 
      WHERE product_id = '${checkStockRequest.product_id}' AND stocks >= ${checkStockRequest.quantity};
    `;

      this.sqlConnection.query(
        query,
        (err: mysql.QueryError | null, rows: mysql.RowDataPacket[]) => {
          if (err) {
            reject(err);
            return;
          }

          if (rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
            return;
          }
        }
      );
    });
  }
  updateStock(updateProductRequest: UpdateStockRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const selectQuery = `SELECT p.stocks FROM products p WHERE p.product_id = '${updateProductRequest.product_id}' FOR UPDATE`;

      this.sqlConnection.query(
        selectQuery,
        (err: mysql.QueryError | null, results: any) => {
          if (err) {
            return reject(err);
          }

          if (results.length === 0) {
            return reject(new Error("Product not found"));
          }

          const currentStock = results[0].stocks;

          if (currentStock < updateProductRequest.quantity) {
            return reject(new Error("Insufficient stock"));
          }

          const updateQuery = `UPDATE products p SET p.stocks = p.stocks - ${updateProductRequest.quantity} WHERE p.product_id = '${updateProductRequest.product_id}'`;

          this.sqlConnection.query(
            updateQuery,
            (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
              if (err) {
                return reject(err);
              }
              resolve();
            }
          );
        }
      );
    });
  }

  restoreStock(restoreStockRequest: RestoreStockRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const q = `UPDATE products p SET p.stocks = p.stocks + ${restoreStockRequest.quantity} WHERE p.product_id = '${restoreStockRequest.product_id}'`;
      this.sqlConnection.query(
        q,
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
}
