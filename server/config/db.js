import mysql from "mysql2/promise";
import { dbConfig } from './dbConfig.js';

// 打印数据库配置信息（生产环境记得删除密码信息）
console.log("Database configuration:", {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

const db = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true, // 是否等待连接池的连接可用
  connectionLimit: 30, // 最大连接数，可根据实际应用负载调整
  queueLimit: 0, // 排队的最大请求数，0 表示不限制
  charset: "utf8mb4", // 设置字符集，支持 Emoji
  connectTimeout: 30000, // 连接超时时间，单位为毫秒，默认值10秒
  ssl: false,
});

// 增强错误处理
db.getConnection()
  .then((connection) => {
    console.log("Successfully connected to MySQL database");
    connection.release();
  })
  .catch((error) => {
    console.error("Failed to connect to MySQL database:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // 检查常见错误
    if (error.code === 'ECONNREFUSED') {
      console.error("Connection refused. Please check if MySQL is running and the host/port are correct.");
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Access denied. Please check username and password.");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error("Database does not exist.");
    }
  });

export default db;
