import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";

// 获取所有分类
export const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM category ORDER BY sort ASC");
    return res.json(createResponse(200, "success", categories));
  } catch (error) {
    console.error("获取分类失败:", error);
    return res.status(500).json(createResponse(500, "error", null, "获取分类失败"));
  }
};

// 添加分类
export const addCategory = async (req, res) => {
  try {
    const { name, sort = 0 } = req.body;

    if (!name) {
      return res.status(400).json(createResponse(400, "error", null, "分类名称不能为空"));
    }

    const [result] = await db.query(
      "INSERT INTO category (name, sort) VALUES (?, ?)",
      [name, sort]
    );

    return res.status(201).json(
      createResponse(201, "success", { id: result.insertId }, "分类添加成功")
    );
  } catch (error) {
    console.error("添加分类失败:", error);
    return res.status(500).json(createResponse(500, "error", null, "添加分类失败"));
  }
};

// 更新分类
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort } = req.body;

    if (!name) {
      return res.status(400).json(createResponse(400, "error", null, "分类名称不能为空"));
    }

    await db.query(
      "UPDATE category SET name = ?, sort = ? WHERE id = ?",
      [name, sort, id]
    );

    return res.json(createResponse(200, "success", null, "分类更新成功"));
  } catch (error) {
    console.error("更新分类失败:", error);
    return res.status(500).json(createResponse(500, "error", null, "更新分类失败"));
  }
};

// 删除分类
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有商品使用该分类
    const [products] = await db.query(
      "SELECT COUNT(*) as count FROM product WHERE category_id = ?",
      [id]
    );

    if (products[0].count > 0) {
      return res.status(400).json(
        createResponse(400, "error", null, "该分类下存在商品，无法删除")
      );
    }

    // 获取与分类相关的所有商品
    const productIds = products.map(product => product.id);

    // 删除与分类相关的订单项
    if (productIds.length > 0) {
      // 删除与分类相关的订单
      await db.query("DELETE FROM `order` WHERE id IN (SELECT order_id FROM order_item WHERE product_id IN (?))", [productIds]);
      // 删除与分类相关的订单项
      await db.query("DELETE FROM order_item WHERE product_id IN (?)", [productIds]);
    }

    // 删除与分类相关的购物车项
    if (productIds.length > 0) {
      await db.query("DELETE FROM cart WHERE product_id IN (?)", [productIds]);
    }

    // 删除与分类相关的商品规格
    if (productIds.length > 0) {
      await db.query("DELETE FROM product_spec WHERE product_id IN (?)", [productIds]);
    }

    // 删除分类下的商品
    await db.query("DELETE FROM product WHERE category_id = ?", [id]);

    // 删除分类
    await db.query("DELETE FROM category WHERE id = ?", [id]);

    return res.json(createResponse(200, "success", null, "分类删除成功"));
  } catch (error) {
    console.error("删除分类失败:", error);
    return res.status(500).json(createResponse(500, "error", null, "删除分类失败"));
  }
}; 