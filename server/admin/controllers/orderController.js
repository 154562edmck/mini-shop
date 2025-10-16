import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";
import { config } from "../../config/config.js";
import { basePath } from '../../config/const.js';

// 获取订单列表（带分页）
export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, order_no, user_name } = req.query;
        const offset = (page - 1) * limit;

        // 修改SQL查询，使用 CONCAT 替代 JSON_OBJECT
        let sql = `
SELECT 
    o.*,
    u.nickname as user_name,
    a.province,
    a.city,
    a.district,
    a.detail as address_detail,
    a.receiver as receiver_name,
    a.phone as receiver_phone,
    GROUP_CONCAT(
        CONCAT(
            '{"id":', oi.id,
            ',"product_name":"', REPLACE(oi.product_name, '"', '\\"'),
            '","product_image":"', REPLACE(oi.product_image, '"', '\\"'),
            '","price":', oi.price,
            ',"quantity":', oi.quantity,
            ',"spec_id":', oi.spec_id,
            ',"spec_name":"', REPLACE(oi.spec_name, '"', '\\"'), '"}'
        )
    ) as items
FROM \`order\` o
LEFT JOIN user u ON o.user_id = u.id
LEFT JOIN address a ON o.address_id = a.id
LEFT JOIN order_item oi ON o.id = oi.order_id
WHERE 1=1
`;

        let countSql = `
SELECT COUNT(*) as total
FROM \`order\` o
LEFT JOIN user u ON o.user_id = u.id
WHERE 1=1
`;

        const params = [];
        const countParams = [];

        // 添加查询条件
        if (status !== undefined && status !== '') {
            sql += " AND o.status = ?";
            countSql += " AND o.status = ?";
            params.push(Number(status));
            countParams.push(Number(status));
        }

        if (order_no) {
            sql += " AND o.order_no LIKE ?";
            countSql += " AND o.order_no LIKE ?";
            params.push(`%${order_no}%`);
            countParams.push(`%${order_no}%`);
        }

        if (user_name) {
            sql += " AND u.nickname LIKE ?";
            countSql += " AND u.nickname LIKE ?";
            params.push(`%${user_name}%`);
            countParams.push(`%${user_name}%`);
        }

        // 添加GROUP BY
        sql += " GROUP BY o.id";

        // 添加排序和分页
        sql += " ORDER BY o.create_time DESC LIMIT ? OFFSET ?";
        params.push(Number(limit), Number(offset));

        // 执行查询
        const [orders] = await db.query(sql, params);
        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        // 格式化订单数据
        const formattedOrders = orders.map(order => {
            try {
                return {
                    ...order,
                    items: order.items ? JSON.parse(`[${order.items}]`) : [],
                    status_text: getOrderStatusText(order),
                    status: Number(order.status),
                    total_amount: Number(order.total_amount),
                    pay_time: order.pay_time ? order.pay_time : null,
                    expire_time: order.expire_time ? order.expire_time : null,
                    pay_method: order.pay_method || 'wechat' // 确保有默认值
                };
            } catch (jsonError) {
                console.error("解析订单项失败:", jsonError);
                return {
                    ...order,
                    items: [],
                    status_text: getOrderStatusText(order),
                    status: Number(order.status),
                    total_amount: Number(order.total_amount),
                    pay_time: order.pay_time ? order.pay_time : null,
                    expire_time: order.expire_time ? order.expire_time : null,
                    pay_method: order.pay_method || 'wechat' // 确保有默认值
                };
            }
        });

        return res.json(createResponse(200, "success", {
            list: formattedOrders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit)
            }
        }));
    } catch (error) {
        console.error("获取订单列表失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "获取订单列表失败"));
    }
};

// 更新订单状态
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status === undefined || ![0, 1, 2, 3, 4].includes(Number(status))) {
            return res.status(400).json(createResponse(400, "error", null, "无效的订单状态"));
        }

        await db.query(
            "UPDATE `order` SET status = ? WHERE id = ?",
            [status, id]
        );

        return res.json(createResponse(200, "success", null, "订单状态更新成功"));
    } catch (error) {
        console.error("更新订单状态失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "更新订单状态失败"));
    }
};

// 删除订单
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // 删除订单项
        await db.query("DELETE FROM order_item WHERE order_id = ?", [id]);
        // 删除订单
        await db.query("DELETE FROM `order` WHERE id = ?", [id]);
        return res.json(createResponse(200, "success", null, "订单删除成功"));
    } catch (error) {
        console.error("删除订单失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "删除订单失败"));
    }
};

// 获取订单状态文本
const getStatusText = (status) => {
    const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已过期'
    };
    return statusMap[status] || '已过期';
};

// 新的状态文本判断函数，考虑过期时间
const getOrderStatusText = (order) => {
    const now = new Date();
    const expireTime = order.expire_time ? new Date(order.expire_time) : null;

    // 已支付状态(1,2,3)优先于过期判断
    if ([1, 2, 3].includes(Number(order.status))) {
        return getStatusText(order.status);
    }

    // 待付款且已过期
    if (Number(order.status) === 0 && expireTime && now > expireTime) {
        return '已过期';
    }

    // 其他状态
    return getStatusText(order.status);
};

// 更新订单
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, total_amount, expire_time, pay_method } = req.body;

        const updateFields = [];
        const params = [];

        if (status !== undefined) {
            updateFields.push("status = ?");
            params.push(Number(status));

            // 如果状态改为已过期(5)，自动设置过期时间为当前时间
            if (Number(status) === 2) {
                updateFields.push("expire_time = CURRENT_TIMESTAMP()");
            }
        }

        if (total_amount !== undefined) {
            updateFields.push("total_amount = ?");
            params.push(Number(total_amount));
        }

        // 只有当状态不是5时，才允许手动设置过期时间
        if (expire_time !== undefined && Number(status) !== 5) {
            updateFields.push("expire_time = ?");
            const formattedDate = new Date(expire_time)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            params.push(formattedDate);
        }

        // 添加支付方式的更新
        if (pay_method !== undefined) {
            updateFields.push("pay_method = ?");
            params.push(pay_method);
        }

        if (updateFields.length === 0) {
            return res.status(400).json(createResponse(400, "error", null, "没有要更新的字段"));
        }

        params.push(id);

        await db.query(
            `UPDATE \`order\` SET ${updateFields.join(", ")} WHERE id = ?`,
            params
        );

        return res.json(createResponse(200, "success", null, "订单更新成功"));
    } catch (error) {
        console.error("更新订单失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "更新订单失败"));
    }
};

// 生成订单分享链接
export const generateShareLink = async (req, res) => {
    try {
        const { id } = req.params;

        // 获取订单信息，包括分享码
        const [orders] = await db.query(
            `SELECT o.*, oi.product_id, o.share_code 
             FROM \`order\` o 
             LEFT JOIN order_item oi ON o.id = oi.order_id 
             WHERE o.id = ? 
             LIMIT 1`,
            [id]
        );

        if (!orders.length) {
            return res.status(404).json(createResponse(404, "error", null, "订单不存在"));
        }

        const order = orders[0];
        let shareCode = order.share_code;

        // 如果没有分享码，则生成新的
        if (!shareCode) {
            // 生成分享码 (商品ID_随机字符串)
            shareCode = `${order.product_id}_${Math.random().toString(36).substring(2, 10)}`;

            // 更新订单的分享码
            await db.query(
                "UPDATE `order` SET share_code = ? WHERE id = ?",
                [shareCode, id]
            );
        }

        // 从环境变量获取clientUrl
        const clientUrl = process.env.CLIENT_URL || config.clientUrl;
        const shareUrl = `${clientUrl}${basePath}/share/${shareCode}`;

        return res.json(createResponse(200, "success", {
            shareUrl,
            shareCode,
            isNewShare: !order.share_code // 添加标识是否是新生成的分享
        }, "获取分享链接成功"));
    } catch (error) {
        console.error("生成分享链接失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "生成分享链接失败"));
    }
}; 