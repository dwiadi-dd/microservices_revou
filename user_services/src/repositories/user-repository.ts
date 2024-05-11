import mysql from "mysql2";
import { UserModel } from "../models/user-model";

export class UserRepository {
  private db: mysql.Pool;

  constructor(db: mysql.Pool) {
    this.db = db;
  }

  create(userModel: UserModel) {
    return new Promise<UserModel>((resolve, reject) => {
      const q = `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`;
      const params = [userModel.email, userModel.password, userModel.name];
      this.db.query(
        q,
        params,
        (err: mysql.QueryError | null, rows: mysql.OkPacket) => {
          if (err) {
            reject(new Error("user already exists"));
            return;
          }
          const insertedUser: UserModel = {
            ...userModel,
            id: rows.insertId,
          };

          resolve(insertedUser);
        }
      );
    });
  }

  validateEmail(email: string) {
    return new Promise<boolean>((resolve, reject) => {
      const q = `SELECT users.id FROM users WHERE email = '${email}`;
      this.db.query(
        q,
        (err: mysql.QueryError | null, rows: mysql.RowDataPacket[]) => {
          if (err) {
            reject(err);
            return;
          }
          if (rows.length === 0) {
            resolve(true);
          } else {
            reject(new Error("user already exists"));
            return;
          }
        }
      );
    });
  }

  getByEmail(email: string) {
    return new Promise<UserModel>((resolve, reject) => {
      const q = `SELECT id, email, role, password, name FROM users WHERE email = '${email}'`;

      this.db.query(
        q,
        (err: mysql.QueryError | null, rows: mysql.RowDataPacket[]) => {
          if (err) {
            reject(err);
            return;
          }
          if (rows.length === 0) {
            reject(new Error("user not found"));
            return;
          }
          resolve({
            id: rows[0].id,
            email: rows[0].email,
            password: rows[0].password,
            name: rows[0].name,
            role: rows[0].role,
          });
        }
      );
    });
  }
}
