import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { getJsConfig } from "./utils/wechatUtils.js";
import { createResponse } from "./common/response.js";
import userRoutes from "./routes/userRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import payRoutes from "./routes/payRoutes.js";
import alipayRoutes from "./routes/alipayRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import easypayRoutes from "./routes/easyPayRoutes.js";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import { config, getConfig, updateConfig } from './config/config.js';
import os from 'os';
import http from "http";
import https from "https";
import fs from 'fs/promises';
import mysql from 'mysql2/promise';

const app = express();

// ES modules 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义配置文件路径
const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 在最开始添加这些日志
console.log("Starting server...");
console.log("Current directory:", process.cwd());
console.log("NODE_ENV:", process.env.NODE_ENV);

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 检查是否已安装
const checkInstalled = async () => {
  try {
    // 检查配置文件是否存在
    await fs.access(CONFIG_FILE);
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);

    // 测试数据库连接
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    await connection.ping();
    await connection.end();

    return true;
  } catch (error) {
    console.error('Installation check failed:', error);
    return false;
  }
};

// 配置 MySQL session 存储
const MySQLStoreSession = MySQLStore(session);
let sessionStore = null;

// 初始化 session 存储
const initSessionStore = async () => {
  try {
    const installed = await checkInstalled();
    if (installed) {
      sessionStore = new MySQLStoreSession({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
      });
      console.log("Session store initialized successfully");
    }
  } catch (error) {
    console.warn("Failed to initialize session store:", error);
  }
};

// 添加 session 中间件
app.use(session({
  key: 'mini_shop_sid',
  secret: 'mini_shop_secret',
  store: sessionStore || new session.MemoryStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  }
}));

// 添加安装检查中间件
app.use(async (req, res, next) => {
  // 跳过对静态资源的数据库检查
  if (req.path.match(/\.(css|js|map|jpg|png|ico)$/)) {
    return next();
  }

  console.log("Checking installation for path:", req.path);

  // 检查是否是管理后台相关的请求
  if (req.path.startsWith('/admin')) {
    const installed = await checkInstalled();
    console.log("Installation status:", installed);

    // 如果未安装
    if (!installed) {
      // 允许访问安装页面和其资源
      if (req.path === '/admin/install.html' ||
        req.path.startsWith('/admin/libs/') ||
        req.path.startsWith('/admin/api/install')) {
        return next();
      }

      // 其他请求重定向到安装页面
      return res.redirect('/admin/install.html');
    }

    // 如果已安装但访问安装页面
    if (installed && req.path === '/admin/install.html') {
      return res.redirect('/admin/');
    }
  }

  next();
});

// 初始化 session 存储
initSessionStore();

// 设置静态资源文件夹（放在检查中间件之后）
app.use(express.static(path.join(__dirname, "public")));

// 允许所有跨域请求的配置
app.use(
  cors({
    origin: "*", // 允许任何域名
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的 HTTP 方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
    credentials: true, // 允许发送认证信息（cookies等）
  })
);

// 如果不想安装 cors 包，也可以直接使用以下中间件
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  // 处理 OPTIONS 请求
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 添加获取 JS-SDK 配置的路由
app.get("/v1/wx/jsconfig", async (req, res) => {
  try {
    const { url } = req.query;
    console.log("url", url);
    if (!url) {
      return res
        .status(400)
        .json(createResponse(400, "error", null, "缺少 url 参数"));
    }

    const config = await getJsConfig(url);
    return res.json(createResponse(200, "success", config, "获取配置成功"));
  } catch (error) {
    console.error("Get JS config error:", error);
    return res
      .status(500)
      .json(createResponse(500, "error", null, "获取配置失败"));
  }
});

// 添加用户路由
app.use("/v1/user", userRoutes);

// 添加商品路由
app.use("/v1/shop", shopRoutes);

// 添加支付路由 
app.use("/v1/pay", payRoutes);

// 添加支付宝支付路由
app.use("/v1/alipay", alipayRoutes);

// 添加易支付路由
app.use("/v1/easypay", easypayRoutes);

// 添加分享路由
app.use("/v1/share", shareRoutes);

// 添加管理后台路由
import adminCategoryRoutes from "./admin/routes/categoryRoutes.js";
import adminAuthRoutes from "./admin/routes/authRoutes.js";
import adminProductRoutes from "./admin/routes/productRoutes.js";
import adminSpecRoutes from "./admin/routes/specRoutes.js";
import adminOrderRoutes from "./admin/routes/orderRoutes.js";
import adminUserRoutes from "./admin/routes/userRoutes.js";
import configRoutes from './admin/routes/configRoutes.js';
import uploadRoutes from "./admin/routes/uploadRoutes.js";
import dashboardRoutes from "./admin/routes/dashboardRoutes.js";
app.use("/admin/api/auth", adminAuthRoutes);
app.use("/admin/api/categories", adminCategoryRoutes);
app.use("/admin/api/products", adminProductRoutes);

app.use("/admin/api/specs", adminSpecRoutes);
app.use("/admin/api/orders", adminOrderRoutes);
app.use("/admin/api/users", adminUserRoutes);
app.use("/admin/api/configs", configRoutes);
app.use("/admin/api/upload", uploadRoutes);
app.use("/admin/api/dashboard", dashboardRoutes);

// 添加配置重载接口
app.post('/admin/api/configs/reload', async (req, res) => {
  try {
    await updateConfig();
    res.json({ success: true, message: '配置已重新加载' });
  } catch (error) {
    res.status(500).json({ success: false, message: '配置重载失败' });
  }
});

// 读取 SQL 文件内容
const initDatabase = async (connection, dbName) => {
  try {
    // 读取 SQL 文件
    const sqlContent = await fs.readFile(path.join(__dirname, 'mini_shop.sql'), 'utf8');

    // 切换到指定数据库
    await connection.query(`USE ${dbName}`);

    // 分割 SQL 语句
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // 依次执行每条 SQL 语句
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 安装相关路由
app.post('/admin/api/install/test', async (req, res) => {
  // 先检查是否已安装
  const installed = await checkInstalled();
  if (installed) {
    return res.status(403).json({
      success: false,
      message: '系统已安装，如需修改配置请登录管理后台'
    });
  }

  const { dbHost, dbPort, dbUser, dbPassword } = req.body;

  if (!dbHost || !dbPort || !dbUser || !dbPassword) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword
    });

    // 测试连接
    await connection.ping();

    // 关闭连接
    await connection.end();
    res.json({ success: true, message: '连接测试成功' });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '连接测试失败：' + error.message,
      error: {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      }
    });
  }
});

app.post('/admin/api/install', async (req, res) => {
  // 先检查是否已安装
  const installed = await checkInstalled();
  if (installed) {
    return res.status(403).json({
      success: false,
      message: '系统已安装，如需修改配置请登录管理后台'
    });
  }

  const { dbHost, dbPort, dbUser, dbPassword, dbName, adminUsername, adminPassword } = req.body;

  if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName || !adminUsername || !adminPassword) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  try {
    // 测试数据库连接
    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
      multipleStatements: true // 允许执行多条 SQL 语句
    });

    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);

    // 初始化数据库表和数据
    await initDatabase(connection, dbName);

    // 保存配置到本地文件
    const configData = {
      db: {
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName
      },
      admin: {
        username: adminUsername,
        password: adminPassword
      }
    };

    await fs.writeFile(CONFIG_FILE, JSON.stringify(configData, null, 2));

    // 使用新的方式更新配置
    await updateConfig();

    // 关闭连接
    await connection.end();

    res.json({
      success: true,
      message: '安装成功，数据库初始化完成'
    });
  } catch (error) {
    console.error('安装失败:', error);
    res.status(500).json({
      success: false,
      message: '安装失败：' + error.message,
      error: {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      }
    });
  }
});

// 添加全局 404 处理中间件（放在所有路由之后）
app.use((req, res) => {
  // API 请求返回 JSON 格式
  if (req.path.startsWith('/v1/') || req.path.startsWith('/admin/api/')) {
    return res.status(404).json({
      code: 404,
      status: "error",
      data: null,
      message: "接口不存在"
    });
  }

  // 静态资源和页面请求返回 404 页面
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 更新错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);

  // API 请求返回 JSON 格式
  if (req.path.startsWith('/v1/') || req.path.startsWith('/admin/api/')) {
    return res.status(err.status || 500).json({
      code: err.status || 500,
      status: "error",
      data: null,
      message: err.message || "服务器内部错误",
      // 在开发环境下返回详细错误信息
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    });
  }

  // 静态资源和页面请求返回简单的文本
  res.status(err.status || 500).send(err.message || "500 Internal Server Error");
});

// 启动服务器并监听端口
const HOST = config.host || "0.0.0.0";
const PORT = 4000;

// 获取内网 IP
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(interfaces)) {
    iface.forEach((details) => {
      if (details.family === "IPv4" && !details.internal) {
        ips.push(details.address);
      }
    });
  }
  return ips;
};

// 获取公网 IP
const getPublicIP = async () => {
  return new Promise((resolve) => {
    http
      .get("http://api.ipify.cn", (res) => {
        let ip = "";
        res.on("data", (chunk) => (ip += chunk));
        res.on("end", () => resolve(ip));
      })

      .on("error", () => resolve("Unavailable"));
  });
};

// 打印系统信息
const logSystemInfo = async () => {
  const localIPs = getLocalIPs().join(", ") || "Unavailable";
  const publicIP = await getPublicIP() || "Unavailable";
  console.log(`Server Details:
  - System: ${os.type()} ${os.release()} (${os.arch()})
  - Hostname: ${os.hostname()}
  - Local IPs: ${localIPs}
  - Public IP: ${publicIP}
  - Listening on: http://${HOST}:${PORT}
  `);
};

// 启动服务器并监听端口
app.listen(PORT, HOST, async () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
  if (typeof logSystemInfo === "function") {
    await logSystemInfo();
  }
});
