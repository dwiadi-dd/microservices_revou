import dotenv from "dotenv";
dotenv.config();

const config = {
  host: process.env.HOST || "localhost",
  port: process.env.HOST_PORT || 5004,
  db_host: process.env.DB_HOST || "localhost",
  db_port: process.env.DB_PORT || "3306",
  db_user: process.env.DB_USER || "root",
  db_password: process.env.DB_PASS || "ROOT",
  db_name: process.env.DB_NAME || "productservicesdb",
  rabbitmq_host: process.env.RABBIT_HOST || "localhost",
  jwt_secret: process.env.SECRET_KEY || "",
  kafka_url: process.env.KAFKA_URL || "",
  kafka_api_key: process.env.KAFKA_KEY || "",
  kafka_api_secret: process.env.KAFKA_API_SECRET || "",
  kafka_resource: process.env.KAFKA_RESOURCE || "",
  kafka_topic: process.env.KAFKA_TOPIC || "",
};

export default config;
