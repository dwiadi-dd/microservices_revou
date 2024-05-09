import mysql from "mysql2";
import config from "./config";

export const mysqlConnection = () => {
  return new Promise<mysql.Pool>((resolve, reject) => {
    const pool = mysql.createPool({
      host: config.db_host,
      port: Number(config.db_port),
      user: config.db_user,
      database: config.db_name,
      password: config.db_password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.release();
        resolve(pool);
      }
    });
  });
};
