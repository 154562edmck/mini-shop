import db from "../config/db.js";
import { createResponse } from "../common/response.js";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config.js";
import { basePath } from "../config/const.js";

// 生成符合微信支付要求的订单号
const generateOrderNo = () => {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `WX${timestamp}${random}`;
};

// 创建订单
export const createOrder = async (req, res) => {
  const { items, address_id } = req.body;
  const userId = req.user.user_id;

  try {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let totalAmount = 0;

      // 1. 验证商品信息并计算总价
      for (const item of items) {
        const [products] = await connection.query(
          "SELECT p.price, p.stock, ps.price as spec_price, ps.stock as spec_stock, ps.name as spec_name " +
          "FROM product p " +
          "LEFT JOIN product_spec ps ON ps.id = ? AND ps.product_id = p.id " +
          "WHERE p.id = ? AND p.is_on_sale = 1",
          [item.spec_id, item.product_id]
        );

        if (products.length === 0) {
          throw new Error("商品不存在或已下架");
        }

        const product = products[0];
        const price = item.spec_id ? product.spec_price : product.price;
        const stock = item.spec_id ? product.spec_stock : product.stock;

        if (stock < item.quantity) {
          throw new Error("商品库存不足");
        }

        totalAmount += price * item.quantity;
      }

      // 2. 创建订单 - 添加过期时间
      const orderNo = generateOrderNo();
      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

      const [orderResult] = await connection.query(
        "INSERT INTO `order` (order_no, user_id, total_amount, status, address_id, expire_time) VALUES (?, ?, ?, 0, ?, ?)",
        [orderNo, userId, totalAmount, address_id, expireTime]
      );
      const orderId = orderResult.insertId;

      // 3. 创建订单项
      for (const item of items) {
        const [productInfo] = await connection.query(
          "SELECT p.name, p.image, " +
          "COALESCE(ps.price, p.price) as final_price, " +
          "ps.id as spec_id, ps.name as spec_name " +
          "FROM product p " +
          "LEFT JOIN product_spec ps ON ps.id = ? AND ps.product_id = p.id " +
          "WHERE p.id = ?",
          [item.spec_id, item.product_id]
        );

        await connection.query(
          "INSERT INTO order_item (order_id, product_id, product_name, product_image, price, quantity, spec_id, spec_name) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            orderId,
            item.product_id,
            productInfo[0].name,
            productInfo[0].image,
            productInfo[0].final_price,
            item.quantity,
            productInfo[0].spec_id,
            productInfo[0].spec_name
          ]
        );
      }

      await connection.commit();

      return res.json(
        createResponse(
          200,
          "success",
          {
            order_id: orderId,
            order_no: orderNo,
            total_amount: totalAmount,
            expire_time: expireTime
          },
          "订单创建成功"
        )
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "error", null, error.message || "创建订单失败")
      );
  }
};

// 获取订单详情
export const getOrderDetail = async (req, res) => {
  const { orderNo } = req.params;

  try {
    // 获取订单基本信息，包括用户信息和地址信息
    const [orders] = await db.query(
      `SELECT o.*, 
              a.receiver, a.phone, a.province, a.city, a.district, a.detail,
              u.id as user_id, u.nickname as user_name, u.avatar as user_avatar
       FROM \`order\` o 
       LEFT JOIN address a ON o.address_id = a.id 
       LEFT JOIN user u ON o.user_id = u.id
       WHERE o.order_no = ?`,
      [orderNo]
    );

    if (orders.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, "error", null, "订单不存在"));
    }

    // 获取订单项
    const [orderItems] = await db.query(
      "SELECT * FROM order_item WHERE order_id = ?",
      [orders[0].id]
    );

    const order = orders[0];
    // 处理订单状态
    let status = order.status;
    const now = new Date();
    const expireTime = new Date(order.expire_time);

    // 状态处理逻辑：
    // 1. 如果已支付，状态保持为 1
    // 2. 如果未支付且已过期，状态设为 5
    // 3. 其他情况保持原状态 0
    if (status === 0 && now > expireTime) {
      status = 2; // 订单过期
    }

    const orderDetail = {
      ...order,
      items: orderItems,
      status: status
    };


    return res.json(createResponse(200, "success", orderDetail));
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return res
      .status(500)
      .json(createResponse(500, "error", null, "获取订单详情失败"));
  }
};

// 更新订单地址
export const updateOrderAddress = async (req, res) => {
  const { orderNo } = req.params;
  const { addressId } = req.body;
  const userId = req.user.user_id;

  try {
    const [result] = await db.query(
      "UPDATE `order` SET address_id = ? " +
      "WHERE order_no = ? AND user_id = ? AND status = 0",
      [addressId, orderNo, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json(createResponse(400, "error", null, "订单不存在或已支付"));
    }

    return res.json(createResponse(200, "success", null, "更新订单地址成功"));
  } catch (error) {
    console.error("更新订单地址失败:", error);
    return res
      .status(500)
      .json(createResponse(500, "error", null, "更新订单地址失败"));
  }
};

// 获取订单列表
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;

    let query = `
      SELECT o.*, 
             a.receiver, a.phone, a.province, a.city, a.district, a.detail
      FROM \`order\` o
      LEFT JOIN address a ON o.address_id = a.id
      WHERE o.user_id = ?
    `;
    const params = [userId];

    if (status !== undefined) {
      query += " AND o.status = ?";
      params.push(status);
    }

    query += " ORDER BY o.create_time DESC";

    const [orders] = await db.query(query, params);

    // 获取每个订单的商品
    for (let order of orders) {
      const [items] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [order.id]
      );
      order.items = items;
    }

    return res.json(createResponse(200, "success", orders));
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "获取订单列表失败")
    );
  }
};

// 删除订单
export const deleteOrder = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const userId = req.user.user_id;

    const [result] = await db.query(
      "DELETE FROM `order` WHERE order_no = ? AND user_id = ?",
      [orderNo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        createResponse(404, "error", null, "订单不存在")
      );
    }

    return res.json(createResponse(200, "success", null, "订单已删除"));
  } catch (error) {
    console.error("删除订单失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "删除订单失败")
    );
  }
};

// 清空订单
export const clearOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;

    let query = "DELETE FROM `order` WHERE user_id = ?";
    const params = [userId];

    if (status !== undefined) {
      query += " AND status = ?";
      params.push(status);
    }

    await db.query(query, params);

    return res.json(createResponse(200, "success", null, "订单已清空"));
  } catch (error) {
    console.error("清空订单失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "清空订单失败")
    );
  }
};

// 更新订单状态
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status } = req.body;
    const userId = req.user.user_id;

    const [result] = await db.query(
      "UPDATE `order` SET status = ? WHERE order_no = ? AND user_id = ?",
      [status, orderNo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        createResponse(404, "error", null, "订单不存在")
      );
    }

    return res.json(createResponse(200, "success", null, "订单状态已更新"));
  } catch (error) {
    console.error("更新订单状态失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "更新订单状态失败")
    );
  }
};

// 修改创建分享订单方法
export const createShareOrder = async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { templateId, payMethod = 'wechat' } = req.body; // 添加 payMethod 参数，默认微信支付
    const userId = req.user.user_id;

    console.log('Debug - Request body:', req.body);
    console.log('Debug - Request params:', req.params);

    // 检查订单是否存在且属于当前用户，同时获取分享码信息
    const [orders] = await db.query(
      "SELECT id, share_code FROM `order` WHERE order_no = ? AND user_id = ? AND status = 0",
      [orderNo, userId]
    );
  

    let payType;
    console.log('Debug - Pay method:', payMethod);
    switch (payMethod) {
      case 'wechat':
        payType = 'wechat';
        break;
      case 'alipay':
        payType = 'alipay';
        break;
      case 'easypay-wxpay':
        payType = 'easypay-wxpay';
        break;
      case 'easypay-alipay':
        payType = 'easypay-alipay';
        break;
      case 'easypay-qqpay':
        payType = 'easypay-qqpay';
        break;
      default:
        payType = 'wechat';
    }

    await db.query(
      "UPDATE `order` SET pay_method = ? WHERE order_no = ?",
      [payType, orderNo]
    );


    console.log('Debug - Query params:', { orderNo, userId });
    console.log('Debug - Found orders:', orders);

    if (orders.length === 0) {
      return res.status(404).json(
        createResponse(404, "error", null, "订单不存在或已支付")
      );
    }

    let shareCode;
    const existingShareCode = orders[0].share_code;
    const shouldResetShareCode = config.ORDER_SHARE_RESET_ENABLED;

    // 判断是否需要重置分享码
    if (existingShareCode && !shouldResetShareCode) {
      // 已有分享码且不需要重置，提取后缀部分并与新模板ID组合
      const shareCodeSuffix = existingShareCode.split('_')[1];
      shareCode = `${templateId}_${shareCodeSuffix}`;
      console.log('Debug - Using existing share code suffix:', shareCodeSuffix);
    } else {
      // 没有分享码或需要重置，生成新的
      shareCode = `${templateId}_${uuidv4().substring(0, 8)}`;
      console.log('Debug - Generated new share code:', shareCode);
    }

    // 根据状态码设置不同的过期时间（使用代码配置）
    /** 
    let expireTime;
    if (templateId === 1) {
      // 携程
      expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期
    } else if (templateId === 2) {
      // 美团
      expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期
    } else if (templateId === 3) {
      // 京东
      expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    } else if (templateId === 4) {
      // 拼多多
      expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    } else if (templateId === 5) {
      // 滴滴
      expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    } else {
      // 未知
      expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    }
    */

    // 修改设置过期时间的逻辑（使用配置文件）
    let expireTime;
    const templateExpireTime = config[`TEMPLATE_${templateId}_EXPIRE_TIME`] || 1440; // 默认24小时
    expireTime = new Date(Date.now() + templateExpireTime * 60 * 1000);

    // 更新订单的分享码、支付方式和过期时间
    await db.query(
      "UPDATE `order` SET share_code = ?, expire_time = ?, pay_method = ? WHERE order_no = ? AND user_id = ?",
      [shareCode, expireTime, payMethod, orderNo, userId]
    );

    // 生成分享链接
    const shareUrl = `${config.clientUrl}${basePath}/share/${shareCode}`;

    return res.json(
      createResponse(200, "success",
        {
          shareUrl,
          shareCode,
          payMethod
        },
        "创建分享成功"
      )
    );
  } catch (error) {
    console.error("创建分享失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "创建分享失败")
    );
  }
};

// 修改获取分享订单信息方法，支持不同模板ID的相同订单
export const getShareOrder = async (req, res) => {
  try {
    const { shareCode } = req.params;
    console.log('Debug - Share code:', shareCode);

    // 提取分享码的后缀部分
    const shareCodeParts = shareCode.split('_');
    if (shareCodeParts.length !== 2) {
      return res.status(400).json(
        createResponse(400, "error", null, "无效的分享码格式")
      );
    }

    const templateId = shareCodeParts[0];
    const shareCodeSuffix = shareCodeParts[1];

    // 检查是否允许访问旧的分享链接
    const allowOldLinks = config.ORDER_SHARE_ALLOW_OLD_LINKS;

    let query;
    let params;

    if (allowOldLinks) {
      // 允许访问旧链接，使用LIKE查询匹配后缀
      query = `SELECT 
        o.id,
        o.order_no,
        o.user_id,
        o.total_amount,
        o.address_id,
        o.status as original_status,
        o.expire_time,
        o.pay_time,
        o.share_code,
        o.pay_method,
        u.nickname as creator_nickname,
        u.avatar as creator_avatar,
        a.receiver,
        a.phone,
        a.province,
        a.city,
        a.district,
        a.detail
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN address a ON o.address_id = a.id
      WHERE o.share_code LIKE ?
      ORDER BY o.update_time DESC
      LIMIT 1`;
      params = [`%_${shareCodeSuffix}`];
      console.log('Debug - Looking for share code pattern:', `%_${shareCodeSuffix}`);
    } else {
      // 不允许访问旧链接，精确匹配完整分享码
      query = `SELECT 
        o.id,
        o.order_no,
        o.user_id,
        o.total_amount,
        o.address_id,
        o.status as original_status,
        o.expire_time,
        o.pay_time,
        o.share_code,
        o.pay_method,
        u.nickname as creator_nickname,
        u.avatar as creator_avatar,
        a.receiver,
        a.phone,
        a.province,
        a.city,
        a.district,
        a.detail
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN address a ON o.address_id = a.id
      WHERE o.share_code = ?`;
      params = [shareCode];
      console.log('Debug - Looking for exact share code:', shareCode);
    }

    // 执行查询
    const [orders] = await db.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json(
        createResponse(404, "error", null, "订单不存在")
      );
    }

    const order = orders[0];
    console.log('Debug - Found order with share_code:', order.share_code);

    // 处理订单状态
    let status = order.original_status;
    const now = new Date();
    const expireTime = new Date(order.expire_time);

    // 状态处理逻辑：
    // 1. 如果已支付，状态保持为 1
    // 2. 如果未支付且已过期，状态设为 5
    // 3. 其他情况保持原状态 0
    if (status === 0 && now > expireTime) {
      status = 2; // 订单过期
    }

    // 同步更新订单状态
    await db.query(
      "UPDATE `order` SET status = ? WHERE id = ?",
      [status, order.id]
    );

    // 获取订单项，包含规格信息和商品信息
    const [items] = await db.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image as product_image,
        p.price as product_original_price,
        p.is_promotion,
        p.merchant_name
      FROM order_item oi
      LEFT JOIN product p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [order.id]
    );

    // 获取第一个商品的商家名称
    const merchantName = items.length > 0 ? items[0].merchant_name : '';

    // 构建完整的订单信息时包含支付方式，但使用请求中的模板ID
    const orderData = {
      ...order,
      status,
      items: items,
      merchant_name: merchantName,
      templateId: parseInt(templateId), // 使用URL中的模板ID
      payMethod: order.pay_method // 添加支付方式到返回数据
    };

    return res.json(
      createResponse(200, "success", orderData, "")
    );
  } catch (error) {
    console.error("获取分享订单失败:", error);
    return res.status(500).json(
      createResponse(500, "error", null, "获取分享订单失败")
    );
  }
};