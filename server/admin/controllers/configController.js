import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";
import { config, getConfig, updateConfig } from "../../config/config.js";
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 获取所有配置
export const getConfigs = async (req, res) => {
    try {
        // 读取数据库配置
        const [dbConfigs] = await db.query(
            "SELECT * FROM system_config ORDER BY group_name, `key`"
        );

        // 读取本地配置文件
        const fileConfig = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));

        // 构建配置组
        const groupedConfigs = {
            "系统配置": [
                {
                    key: "admin_username",
                    description: "管理员用户名",
                    type: "text",
                    value: fileConfig.admin.username,
                    group_name: "系统配置",
                    source: "配置文件"
                },
                {
                    key: "admin_password",
                    description: "管理员密码",
                    type: "password",
                    value: fileConfig.admin.password,
                    group_name: "系统配置",
                    source: "配置文件"
                },
                {
                    key: "database",
                    description: "数据库配置",
                    type: "textarea",
                    value: JSON.stringify(fileConfig.db, null, 2),
                    group_name: "系统配置",
                    source: "配置文件"
                }
            ]
        };

        // 添加数据库中的其他配置
        dbConfigs.forEach(config => {
            if (!groupedConfigs[config.group_name]) {
                groupedConfigs[config.group_name] = [];
            }
            groupedConfigs[config.group_name].push(config);
        });

        return res.json(createResponse(200, "success", groupedConfigs));
    } catch (error) {
        console.error("获取配置失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "获取配置失败"));
    }
};

// 更新配置
export const updateConfigSettings = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        // 处理配置文件中的配置
        if (key === 'admin_username' || key === 'admin_password' || key === 'database') {
            const fileConfig = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf8'));

            if (key === 'admin_username') {
                fileConfig.admin.username = value;
            } else if (key === 'admin_password') {
                fileConfig.admin.password = value;
            } else if (key === 'database') {
                try {
                    fileConfig.db = JSON.parse(value);
                } catch (e) {
                    return res.status(400).json(
                        createResponse(400, "error", null, "数据库配置格式不正确")
                    );
                }
            }

            // 保存到配置文件
            await fs.writeFile(CONFIG_FILE, JSON.stringify(fileConfig, null, 2));

            // 重新加载配置
            await updateConfig(); // 使用 config.js 中导出的 updateConfig 方法

            return res.json(createResponse(200, "success", null, "配置更新成功，部分配置可能需要重启服务生效"));
        }

        // 处理数据库中的配置
        await db.query(
            "UPDATE system_config SET value = ? WHERE `key` = ?",
            [value, key]
        );

        // 更新环境变量
        process.env[key] = value;

        // 重新加载配置
        await updateConfig(); // 使用 config.js 中导出的 updateConfig 方法

        return res.json(createResponse(200, "success", null, "配置更新成功"));
    } catch (error) {
        console.error("更新配置失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "更新配置失败"));
    }
}; 