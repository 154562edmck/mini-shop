import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, nickname } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT 
                u.*,
                COUNT(DISTINCT o.id) as order_count,
                SUM(CASE WHEN o.status = 1 OR o.status = 2 THEN o.total_amount ELSE 0 END) as total_spent
            FROM user u
            LEFT JOIN \`order\` o ON u.id = o.user_id
            WHERE 1=1
        `;

        const params = [];

        if (nickname) {
            sql += " AND u.nickname LIKE ?";
            params.push(`%${nickname}%`);
        }

        sql += " GROUP BY u.id ORDER BY u.create_time DESC LIMIT ? OFFSET ?";
        params.push(Number(limit), Number(offset));

        // 计算总数的SQL
        let countSql = "SELECT COUNT(*) as total FROM user WHERE 1=1";
        const countParams = [];

        if (nickname) {
            countSql += " AND nickname LIKE ?";
            countParams.push(`%${nickname}%`);
        }

        const [users] = await db.query(sql, params);
        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        // 格式化用户数据
        const formattedUsers = users.map(user => ({
            ...user,
            total_spent: Number(user.total_spent || 0),
            create_time: new Date(user.create_time).toLocaleString(),
            token_expire_time: user.token_expire_time ? new Date(user.token_expire_time).toLocaleString() : null
        }));

        return res.json(createResponse(200, "success", {
            list: formattedUsers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit)
            }
        }));
    } catch (error) {
        console.error("获取用户列表失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "获取用户列表失败"));
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 删除用户相关的订单项
        await db.query("DELETE FROM order_item WHERE order_id IN (SELECT id FROM `order` WHERE user_id = ?)", [id]);

        // 删除用户的订单
        await db.query("DELETE FROM `order` WHERE user_id = ?", [id]);

        // 删除用户的购物车
        await db.query("DELETE FROM cart WHERE user_id = ?", [id]);

        // 删除用户的地址
        await db.query("DELETE FROM address WHERE user_id = ?", [id]);

        // 删除用户
        await db.query("DELETE FROM user WHERE id = ?", [id]);

        return res.json(createResponse(200, "success", null, "用户及其相关内容删除成功"));
    } catch (error) {
        console.error("删除用户失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "删除用户失败"));
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname, avatar } = req.body;

        if (!nickname) {
            return res.status(400).json(createResponse(400, "error", null, "昵称不能为空"));
        }

        // 构建更新SQL
        const updateFields = ["nickname = ?"];
        const params = [nickname];

        // 如果提供了avatar，添加到更新字段中
        if (avatar !== undefined) {
            updateFields.push("avatar = ?");
            params.push(avatar);
        }

        // 添加ID到参数数组
        params.push(id);

        const sql = `UPDATE user SET ${updateFields.join(", ")} WHERE id = ?`;
        await db.query(sql, params);

        return res.json(createResponse(200, "success", null, "用户信息更新成功"));
    } catch (error) {
        console.error("更新用户信息失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "更新用户信息失败"));
    }
}; 