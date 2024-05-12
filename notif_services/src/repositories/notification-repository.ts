import mysql from "mysql2";
import {
  CreateNotifRequest,
  NotificationModel,
} from "../models/notification-model";

export class NotificationRepository {
  private db: mysql.Pool;

  constructor(db: mysql.Pool) {
    this.db = db;
  }

  create(message: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const q = `INSERT INTO notifications (message) 
                values(?)`;
      this.db.query(
        q,
        [message],
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
