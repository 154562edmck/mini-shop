import db from "./db.js";
import { dbConfig } from './dbConfig.js';

import fs from 'fs/promises';
import path from 'path';
import { AlipaySdk } from 'alipay-sdk';
import Easypay from 'easypay-node-sdk';
import WechatPay from "wechatpay-node-v3";

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 从配置文件加载配置
const loadConfigFile = async () => {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    const jsonConfig = JSON.parse(configData);
    // 配置环境变量
    process.env.ADMIN_USERNAME = jsonConfig.admin.username;
    process.env.ADMIN_PASSWORD = jsonConfig.admin.password;
    return jsonConfig;
  } catch (error) {
    console.error("无法从配置文件加载配置:", error);
    return null;
  }
};

// 从数据库加载其他配置
const loadConfigFromDB = async () => {
  try {
    const [configs] = await db.query("SELECT `key`, value FROM system_config");
    const configMap = {};
    configs.forEach(config => {
      // 将数据库中的配置加载到环境变量
      process.env[config.key] = config.value;
      configMap[config.key] = config.value;
    });
    return configMap;
  } catch (error) {
    console.error("从数据库加载配置失败:", error);
    return {};
  }
}

// 导出配置对象
export const getConfig = async () => {
  let fileConfig = null;
  try {
    fileConfig = await loadConfigFile();
  } catch (error) {
    console.warn("加载配置文件失败:", error);
  }

  try {
    await loadConfigFromDB();
  } catch (error) {
    console.warn("从数据库加载配置失败:", error);
  }

  // 加载数据库中的配置
  const [configs] = await db.query("SELECT * FROM system_config");
  configs.forEach(config => {
    // 对于某些特定的配置，我们需要保持其原始字符串格式
    if (config.key === 'SHARE_TEMPLATE_CONFIGS') {
      process.env[config.key] = config.value;
    } else {
      process.env[config.key] = config.value;
    }
  });

  return {
    // 端口
    host: '0.0.0.0',
    port: Number(process.env.PORT),

    // 管理员（从配置文件读取）
    admin: fileConfig?.admin || {
      username: process.env.ADMIN_USERNAME || (await loadConfigFromDB())['ADMIN_USERNAME'],
      password: process.env.ADMIN_PASSWORD || (await loadConfigFromDB())['ADMIN_PASSWORD'],
    },

    // 数据库（使用.env文件中的配置）
    // 数据库（使用dbConfig）
    db: dbConfig,

    // 微信
    wechat: {
      appId: process.env.WECHAT_APP_ID || (await loadConfigFromDB())['WECHAT_APP_ID'],
      appSecret: process.env.WECHAT_APP_SECRET || (await loadConfigFromDB())['WECHAT_APP_SECRET'],
    },

    // 支付宝
    alipay: {
      appId: process.env.ALIPAY_APP_ID || (await loadConfigFromDB())['ALIPAY_APP_ID'],
      privateKey: process.env.ALIPAY_PRIVATE_KEY || (await loadConfigFromDB())['ALIPAY_PRIVATE_KEY'],
      publicKey: process.env.ALIPAY_PUBLIC_KEY || (await loadConfigFromDB())['ALIPAY_PUBLIC_KEY'],
    },

    // 支付
    pay: {
      mchId: process.env.MCH_ID || (await loadConfigFromDB())['MCH_ID'],
      serial_no: process.env.SERIAL_NO || (await loadConfigFromDB())['SERIAL_NO'],
      cert: process.env.CERT_CONTENT || (await loadConfigFromDB())['CERT_CONTENT'],         // 直接使用证书内容
      mchPrivateKey: process.env.PRIVATE_KEY_CONTENT || (await loadConfigFromDB())['PRIVATE_KEY_CONTENT'],  // 直接使用私钥内容
      apiV3Key: process.env.API_V3_KEY || (await loadConfigFromDB())['API_V3_KEY'],
    },

    // 基础URL
    baseUrl: process.env.BASE_URL || (await loadConfigFromDB())['BASE_URL'],

    // 客户端URL
    clientUrl: process.env.CLIENT_URL || (await loadConfigFromDB())['CLIENT_URL'],

    // 共享模板配置
    SHARE_TEMPLATE_CONFIGS: process.env.SHARE_TEMPLATE_CONFIGS || (await loadConfigFromDB())['SHARE_TEMPLATE_CONFIGS'],

    // TEMPLATE_1_EXPIRE_TIME
    TEMPLATE_1_EXPIRE_TIME: process.env.TEMPLATE_1_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_1_EXPIRE_TIME'],

    // TEMPLATE_2_EXPIRE_TIME
    TEMPLATE_2_EXPIRE_TIME: process.env.TEMPLATE_2_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_2_EXPIRE_TIME'],

    // TEMPLATE_3_EXPIRE_TIME
    TEMPLATE_3_EXPIRE_TIME: process.env.TEMPLATE_3_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_3_EXPIRE_TIME'],

    // TEMPLATE_4_EXPIRE_TIME
    TEMPLATE_4_EXPIRE_TIME: process.env.TEMPLATE_4_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_4_EXPIRE_TIME'],

    // TEMPLATE_5_EXPIRE_TIME
    TEMPLATE_5_EXPIRE_TIME: process.env.TEMPLATE_5_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_5_EXPIRE_TIME'],

    // TEMPLATE_6_EXPIRE_TIME
    TEMPLATE_6_EXPIRE_TIME: process.env.TEMPLATE_6_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_6_EXPIRE_TIME'],

    // TEMPLATE_7_EXPIRE_TIME
    TEMPLATE_7_EXPIRE_TIME: process.env.TEMPLATE_7_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_7_EXPIRE_TIME'],

    // TEMPLATE_8_EXPIRE_TIME
    TEMPLATE_8_EXPIRE_TIME: process.env.TEMPLATE_8_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_8_EXPIRE_TIME'],

    // TEMPLATE_9_EXPIRE_TIME
    TEMPLATE_9_EXPIRE_TIME: process.env.TEMPLATE_9_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_9_EXPIRE_TIME'],

    // TEMPLATE_10_EXPIRE_TIME
    TEMPLATE_10_EXPIRE_TIME: process.env.TEMPLATE_10_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_10_EXPIRE_TIME'],

    // TEMPLATE_11_EXPIRE_TIME
    TEMPLATE_11_EXPIRE_TIME: process.env.TEMPLATE_11_EXPIRE_TIME || (await loadConfigFromDB())['TEMPLATE_11_EXPIRE_TIME'],

    // 易支付
    easypay: {
      domain: process.env.EASYPAY_DOMAIN || (await loadConfigFromDB())['EASYPAY_DOMAIN'],
      pid: process.env.EASYPAY_PID || (await loadConfigFromDB())['EASYPAY_PID'],
      key: process.env.EASYPAY_KEY || (await loadConfigFromDB())['EASYPAY_KEY'],
      publicKey: process.env.EASYPAY_PUBLIC_KEY || (await loadConfigFromDB())['EASYPAY_PUBLIC_KEY'],
      privateKey: process.env.EASYPAY_PRIVATE_KEY || (await loadConfigFromDB())['EASYPAY_PRIVATE_KEY'],
    },

    // 订单分享码重置配置
    ORDER_SHARE_RESET_ENABLED: process.env.ORDER_SHARE_RESET_ENABLED || (await loadConfigFromDB())['ORDER_SHARE_RESET_ENABLED'],

    // 访问旧分享链接配置
    ORDER_SHARE_ALLOW_OLD_LINKS: process.env.ORDER_SHARE_ALLOW_OLD_LINKS || (await loadConfigFromDB())['ORDER_SHARE_ALLOW_OLD_LINKS'],

    // 是否启用当面付
    ALIPAY_TRADE_PRECREATE_ENABLED: process.env.ALIPAY_TRADE_PRECREATE_ENABLED || (await loadConfigFromDB())['ALIPAY_TRADE_PRECREATE_ENABLED'],
  };
};

// 修改配置导出方式
let configInstance = {};  // 初始化为空对象而不是undefined

export const config = {
  get admin() {
    return configInstance?.admin || {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    };
  },
  get db() {
    return configInstance?.db;
  },
  get host() {
    return configInstance?.host;
  },
  get port() {
    return configInstance?.port;
  },
  get wechat() {
    return configInstance?.wechat;
  },
  get pay() {
    return configInstance?.pay;
  },
  get baseUrl() {
    return configInstance?.baseUrl;
  },
  get clientUrl() {
    return configInstance?.clientUrl;
  },
  get SHARE_TEMPLATE_CONFIGS() {
    return process.env.SHARE_TEMPLATE_CONFIGS;
  },
  get alipay() {
    return configInstance?.alipay;
  },
  get TEMPLATE_1_EXPIRE_TIME() {
    return process.env.TEMPLATE_1_EXPIRE_TIME;
  },
  get TEMPLATE_2_EXPIRE_TIME() {
    return process.env.TEMPLATE_2_EXPIRE_TIME;
  },
  get TEMPLATE_3_EXPIRE_TIME() {
    return process.env.TEMPLATE_3_EXPIRE_TIME;
  },
  get TEMPLATE_4_EXPIRE_TIME() {
    return process.env.TEMPLATE_4_EXPIRE_TIME;
  },
  get TEMPLATE_5_EXPIRE_TIME() {
    return process.env.TEMPLATE_5_EXPIRE_TIME;
  },
  get TEMPLATE_6_EXPIRE_TIME() {
    return process.env.TEMPLATE_6_EXPIRE_TIME;
  },
  get TEMPLATE_7_EXPIRE_TIME() {
    return process.env.TEMPLATE_7_EXPIRE_TIME;
  },
  get TEMPLATE_8_EXPIRE_TIME() {
    return process.env.TEMPLATE_8_EXPIRE_TIME;
  },
  get TEMPLATE_9_EXPIRE_TIME() {
    return process.env.TEMPLATE_9_EXPIRE_TIME;
  },
  get TEMPLATE_10_EXPIRE_TIME() {
    return process.env.TEMPLATE_10_EXPIRE_TIME;
  },
  get TEMPLATE_11_EXPIRE_TIME() {
    return process.env.TEMPLATE_11_EXPIRE_TIME;
  },
  get easypay() {
    return configInstance?.easypay;
  },
  get ORDER_SHARE_RESET_ENABLED() {
    return process.env.ORDER_SHARE_RESET_ENABLED === '1';
  },

  get ORDER_SHARE_ALLOW_OLD_LINKS() {
    return process.env.ORDER_SHARE_ALLOW_OLD_LINKS === '1';
  },

  get ALIPAY_TRADE_PRECREATE_ENABLED() {
    return process.env.ALIPAY_TRADE_PRECREATE_ENABLED === '1';
  },
};

// 声明全局的支付SDK变量
export let alipaySdk = null;
export let easyPaySdk = null;
export let wechatPay = null;

// 初始化支付宝 SDK
const initAlipaySDK = (config) => {
  try {
    alipaySdk = new AlipaySdk({
      appId: config.alipay.appId,
      privateKey: config.alipay.privateKey,
      alipayPublicKey: config.alipay.publicKey,
      gateway: 'https://openapi.alipay.com/gateway.do',
    });
    console.log('支付宝支付重新初始化成功');
  } catch (error) {
    console.warn("支付宝支付初始化失败:", error.message);
  }
};

// 初始化易支付 SDK
const initEasyPaySDK = (config) => {
  try {
    easyPaySdk = new Easypay({
      domain: config.easypay.domain,
      pid: config.easypay.pid,
      key: config.easypay.key
    });
    console.log('易支付重新初始化成功');
  } catch (error) {
    console.warn("易支付初始化失败:", error.message);
  }
};

// 初始化微信支付 SDK
const initWechatPaySDK = (config) => {
  try {
    wechatPay = new WechatPay({
      appid: config.wechat.appId,
      mchid: config.pay.mchId,
      serial_no: config.pay.serial_no,
      publicKey: config.pay.cert,
      privateKey: config.pay.mchPrivateKey,
      key: config.pay.apiV3Key,
    });
    console.log('微信支付重新初始化成功');
  } catch (error) {
    console.warn("微信支付初始化失败:", error.message);
  }
};

// 修改 updateConfig 函数
export const updateConfig = async () => {
  try {
    const newConfig = await getConfig();
    // 使用Object.assign更新configInstance
    Object.assign(configInstance, newConfig);

    // 重新初始化所有支付相关SDK
    initAlipaySDK(newConfig);
    initEasyPaySDK(newConfig);
    initWechatPaySDK(newConfig);

    console.log("配置更新成功");
    return configInstance;
  } catch (error) {
    console.error("配置更新失败:", error);
    throw error;
  }
};

// 初始化配置
try {
  await updateConfig();
} catch (error) {
  console.error("初始化配置失败，使用默认配置:", error);
  // 确保configInstance至少有基本配置
  configInstance = {
    host: '0.0.0.0',
    port: 3000,
    db: dbConfig,
    admin: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    }
  };
}

// 验证环境变量时不抛出错误
const validateEnvVars = () => {
  const requiredEnvVars = [
    'PORT',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'WECHAT_APP_ID',
    'WECHAT_APP_SECRET',
    'MCH_ID',
    'SERIAL_NO',
    'API_V3_KEY',
    'BASE_URL',
    'CLIENT_URL',
    'CERT_CONTENT',
    'PRIVATE_KEY_CONTENT',
    'ALIPAY_APP_ID',
    'ALIPAY_PRIVATE_KEY',
    'ALIPAY_PUBLIC_KEY',
    'EASYPAY_DOMAIN',
    'EASYPAY_PID',
    'EASYPAY_KEY',
    'ALIPAY_TRADE_PRECREATE_ENABLED'
  ];

  const missingVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.warn(`警告: 以下环境变量未设置: ${missingVars.join(', ')}`);
  }
};

validateEnvVars();