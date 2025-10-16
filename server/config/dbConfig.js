import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// 加载.env文件（作为后备配置）
dotenv.config();

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 从配置文件加载数据库配置
const loadDbConfig = async () => {
    try {
        const configData = await fs.readFile(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configData);
        return config.db;
    } catch (error) {
        // 如果无法读取配置文件，则使用环境变量中的配置
        console.warn('无法从配置文件加载数据库配置，使用环境变量配置:', error.message);
        return {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        };
    }
};

// 导出数据库配置
export const dbConfig = await loadDbConfig();