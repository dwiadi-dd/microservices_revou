import mysql from "mysql2";

export class TransactionHelper {
  private sqlConnection: mysql.Pool;
  private connection: mysql.PoolConnection | null = null;

  constructor(sqlConnection: mysql.Pool) {
    this.sqlConnection = sqlConnection;
  }

  beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sqlConnection.getConnection((err, connection) => {
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
}
