import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 获取今日已付款订单数
        const [todayOrders] = await db.query(`
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as amount
            FROM \`order\`
            WHERE DATE(create_time) = CURDATE()
            AND status IN (1, 2)  /* 已付款的订单 */
        `);

        // 获取总已付款订单数
        const [totalOrders] = await db.query(`
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as amount
            FROM \`order\`
            WHERE status IN (1, 2)  /* 已付款的订单 */
        `);

        // 获取各状态订单统计
        const [orderStatusStats] = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as amount
            FROM \`order\`
            GROUP BY status
            ORDER BY status
        `);

        // 获取订单状态分布（用于调试）
        const [orderStatusDistribution] = await db.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM \`order\`
            GROUP BY status
        `);
        console.log('订单状态分布:', orderStatusDistribution);

        // 获取商品总数和库存预警数
        const [products] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as lowStock
            FROM product
            WHERE is_on_sale = 1
        `);

        // 获取用户总数
        const [users] = await db.query(`
            SELECT COUNT(*) as count
            FROM user
        `);

        // 获取近7天订单统计（所有状态的订单）
        const [weeklyOrders] = await db.query(`
            SELECT 
                DATE(create_time) as date,
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as amount
            FROM \`order\`
            WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(create_time)
            ORDER BY date
        `);

        // 获取商品分类统计
        const [categoryStats] = await db.query(`
            SELECT 
                c.name,
                COUNT(p.id) as count
            FROM category c
            LEFT JOIN product p ON c.id = p.category_id AND p.is_on_sale = 1
            GROUP BY c.id, c.name
            HAVING count > 0
            ORDER BY count DESC
        `);

        return res.json(createResponse(200, "success", {
            today: {
                orderCount: Number(todayOrders[0].count),
                orderAmount: Number(todayOrders[0].amount)
            },
            total: {
                orderCount: Number(totalOrders[0].count),
                orderAmount: Number(totalOrders[0].amount),
                productCount: Number(products[0].total),
                userCount: Number(users[0].count)
            },
            orderStatus: orderStatusStats.map(stat => ({
                status: stat.status,
                count: Number(stat.count),
                amount: Number(stat.amount)
            })),
            alerts: {
                lowStock: Number(products[0].lowStock)
            },
            weeklyOrders: weeklyOrders.map(order => ({
                date: order.date,
                count: Number(order.count),
                amount: Number(order.amount)
            })),
            categoryStats: categoryStats.map(stat => ({
                name: stat.name,
                count: Number(stat.count)
            }))
        }));
    } catch (error) {
        console.error("获取仪表盘数据失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "获取仪表盘数据失败"));
    }
}; 