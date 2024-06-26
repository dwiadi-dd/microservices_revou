import dotenv from "dotenv";
dotenv.config();
const config = {
  host: process.env.HOST || "localhost",
  port: process.env.HOST_PORT || 5001,
  db_host: process.env.DB_HOST || "localhost",
  db_port: process.env.DB_PORT || "3306",
  db_user: process.env.DB_USER || "root",
  db_password: process.env.DB_PASS || "ROOT",
  db_name: process.env.DB_NAME || "userservicesdb",
};

export default config;
