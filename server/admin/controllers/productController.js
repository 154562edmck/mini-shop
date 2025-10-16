import db from "../../config/db.js";
import { createResponse } from "../../common/response.js";
import { Parser } from '@json2csv/plainjs';
import * as csv from 'csv-parse';
import multer from 'multer';
import fs from 'fs';

// 获取商品列表
export const getProducts = async (req, res) => {
    try {
        const { name, category_id, is_on_sale, page = 1, limit = 15 } = req.query;

        // 构建基础查询
        let sql = `
            SELECT p.*, c.name as category_name 
            FROM product p 
            LEFT JOIN category c ON p.category_id = c.id 
            WHERE 1=1
        `;
        const params = [];

        // 添加搜索条件
        if (name) {
            sql += " AND (p.name LIKE ? OR p.merchant_name LIKE ?)";
            params.push(`%${name}%`, `%${name}%`);
        }

        if (category_id) {
            sql += " AND p.category_id = ?";
            params.push(Number(category_id));
        }

        if (is_on_sale !== undefined && is_on_sale !== '') {
            sql += " AND p.is_on_sale = ?";
            params.push(Number(is_on_sale));
        }

        // 先获取总数
        const [total] = await db.query(
            `SELECT COUNT(*) as total FROM (${sql}) as t`,
            params
        );

        // 添加分页
        sql += " ORDER BY p.create_time DESC LIMIT ? OFFSET ?";
        const offset = (Number(page) - 1) * Number(limit);
        params.push(Number(limit), offset);

        const [products] = await db.query(sql, params);

        // 格式化数据
        const formattedProducts = products.map(product => ({
            ...product,
            category_id: Number(product.category_id),
            is_on_sale: Number(product.is_on_sale)
        }));

        return res.json(createResponse(200, "success", {
            list: formattedProducts,
            total: total[0].total,
            page: Number(page),
            limit: Number(limit)
        }));
    } catch (error) {
        console.error("获取商品列表失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "获取商品列表失败"));
    }
};

// 添加商品
export const addProduct = async (req, res) => {
    try {
        const {
            name,
            merchant_name, // 新增商家名称
            category_id,
            image,
            original_price,
            price,
            stock,
            is_on_sale = 1
        } = req.body;

        if (!name || !category_id || !price) {
            return res.status(400).json(createResponse(400, "error", null, "缺少必要参数"));
        }

        const [result] = await db.query(
            `INSERT INTO product (
                name, 
                merchant_name, 
                category_id, 
                image, 
                original_price, 
                price, 
                stock, 
                is_on_sale
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, merchant_name || '', category_id, image, original_price, price, stock, is_on_sale]
        );

        return res.status(201).json(
            createResponse(201, "success", { id: result.insertId }, "商品添加成功")
        );
    } catch (error) {
        console.error("添加商品失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "添加商品失败"));
    }
};

// 更新商品
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            merchant_name, // 新增商家名称
            category_id,
            image,
            original_price,
            price,
            stock,
            is_on_sale
        } = req.body;

        if (!name || !category_id || !price) {
            return res.status(400).json(createResponse(400, "error", null, "缺少必要参数"));
        }

        await db.query(
            `UPDATE product SET 
                name = ?, 
                merchant_name = ?,
                category_id = ?, 
                image = ?, 
                original_price = ?, 
                price = ?, 
                stock = ?, 
                is_on_sale = ? 
            WHERE id = ?`,
            [name, merchant_name || '', category_id, image, original_price, price, stock, is_on_sale, id]
        );

        return res.json(createResponse(200, "success", null, "商品更新成功"));
    } catch (error) {
        console.error("更新商品失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "更新商品失败"));
    }
};

// 删除商品
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // 获取与商品相关的所有订单项
        const [orderItems] = await db.query("SELECT DISTINCT order_id FROM order_item WHERE product_id = ?", [id]);
        const orderIds = orderItems.map(item => item.order_id);

        // 如果有相关订单，删除这些订单
        if (orderIds.length > 0) {
            await db.query("DELETE FROM `order` WHERE id IN (SELECT order_id FROM order_item WHERE product_id IN (?))", [orderIds]);
        }

        // 删除与商品相关的订单项
        await db.query("DELETE FROM order_item WHERE product_id = ?", [id]);

        // 删除商品的规格
        await db.query("DELETE FROM product_spec WHERE product_id = ?", [id]);

        // 删除购物车
        await db.query("DELETE FROM cart WHERE product_id = ?", [id]);

        // 删除商品
        await db.query("DELETE FROM product WHERE id = ?", [id]);

        return res.json(createResponse(200, "success", null, "商品及其相关内容删除成功"));
    } catch (error) {
        console.error("删除商品失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "删除商品失败"));
    }
};

// 导出商品数据
export const exportProducts = async (req, res) => {
    try {
        // 获取所有商品数据，包含分类名称
        const [products] = await db.query(`
            SELECT 
                p.*,
                c.name as category_name,
                c.id as category_id 
            FROM product p 
            LEFT JOIN category c ON p.category_id = c.id
        `);

        // 获取所有规格数据
        const [specs] = await db.query(`
            SELECT * FROM product_spec
        `);

        // 组织数据结构
        const exportData = products.map(product => {
            const productSpecs = specs.filter(spec => spec.product_id === product.id);
            return {
                ...product,
                category_name: product.category_name || '', // 添加分类名称
                specs: productSpecs
            };
        });

        // 设置CSV Parser选项
        const opts = {
            fields: [
                'id',
                'name',
                'merchant_name',
                {
                    label: 'category_id',
                    value: 'category_id'
                },
                {
                    label: 'category_name', // 添加分类名称字段
                    value: 'category_name'
                },
                'image',
                'original_price',
                'price',
                'stock',
                'is_on_sale',
                {
                    label: 'specs',
                    value: row => JSON.stringify(row.specs)
                }
            ]
        };

        const parser = new Parser(opts);
        const csv = parser.parse(exportData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');

        return res.send(csv);
    } catch (error) {
        console.error("导出商品数据失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "导出商品数据失败"));
    }
};

// 导入商品数据
export const importProducts = async (req, res) => {
    const upload = multer({ dest: 'public/upload/' }).single('file');

    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json(createResponse(400, "error", null, "文件上传失败"));
        }

        if (!req.file) {
            return res.status(400).json(createResponse(400, "error", null, "请选择文件"));
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const fileContent = fs.readFileSync(req.file.path, 'utf-8');
            const records = await new Promise((resolve, reject) => {
                csv.parse(fileContent, {
                    columns: true,
                    skip_empty_lines: true,
                    cast: true,
                }, (error, records) => {
                    if (error) reject(error);
                    else resolve(records);
                });
            });

            // 获取所有分类的映射
            const [categories] = await connection.query('SELECT id, name FROM category');
            const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

            for (const record of records) {
                // 处理分类
                let categoryId = record.category_id;

                // 如果有分类名称，尝试通过名称找到对应的分类ID
                if (record.category_name) {
                    const categoryNameLower = record.category_name.toLowerCase();
                    if (categoryMap.has(categoryNameLower)) {
                        categoryId = categoryMap.get(categoryNameLower);
                    } else {
                        // 如果分类不存在，创建新分类
                        const [newCategory] = await connection.query(
                            'INSERT INTO category (name) VALUES (?)',
                            [record.category_name]
                        );
                        categoryId = newCategory.insertId;
                        categoryMap.set(categoryNameLower, categoryId);
                    }
                }

                // 处理商品数据
                const productData = {
                    name: record.name,
                    merchant_name: record.merchant_name || '',
                    category_id: categoryId,
                    image: record.image || '',
                    original_price: parseFloat(record.original_price) || 0,
                    price: parseFloat(record.price) || 0,
                    stock: parseInt(record.stock) || 0,
                    is_on_sale: parseInt(record.is_on_sale) || 1
                };

                let productId = record.id ? parseInt(record.id) : null;

                if (productId) {
                    // 检查商品是否存在
                    const [existingProduct] = await connection.query(
                        'SELECT id FROM product WHERE id = ?',
                        [productId]
                    );

                    if (existingProduct.length > 0) {
                        // 更新已存在的商品
                        await connection.query(
                            `UPDATE product SET 
                                name = ?, 
                                merchant_name = ?,
                                category_id = ?,
                                image = ?,
                                original_price = ?,
                                price = ?,
                                stock = ?,
                                is_on_sale = ?
                            WHERE id = ?`,
                            [
                                productData.name,
                                productData.merchant_name,
                                productData.category_id,
                                productData.image,
                                productData.original_price,
                                productData.price,
                                productData.stock,
                                productData.is_on_sale,
                                productId
                            ]
                        );
                    } else {
                        // ID 不存在，创建新商品
                        const [result] = await connection.query(
                            'INSERT INTO product SET ?',
                            productData
                        );
                        productId = result.insertId;
                    }
                } else {
                    // 插入新商品
                    const [result] = await connection.query(
                        'INSERT INTO product SET ?',
                        productData
                    );
                    productId = result.insertId;
                }

                // 处理规格数据
                let specs = [];
                try {
                    specs = JSON.parse(record.specs || '[]');
                } catch (e) {
                    console.error('规格数据解析失败:', e);
                    specs = [];
                }

                // 删除原有规格
                await connection.query(
                    'DELETE FROM product_spec WHERE product_id = ?',
                    [productId]
                );

                // 添加新规格
                for (const spec of specs) {
                    const specData = {
                        product_id: productId,
                        name: spec.name,
                        price: parseFloat(spec.price) || 0,
                        stock: parseInt(spec.stock) || 0
                    };

                    await connection.query(
                        'INSERT INTO product_spec SET ?',
                        specData
                    );
                }
            }

            await connection.commit();
            return res.json(createResponse(200, "success", null, "导入成功"));

        } catch (error) {
            await connection.rollback();
            console.error("导入商品数据失败:", error);
            return res.status(500).json(createResponse(500, "error", null, "导入商品数据失败"));
        } finally {
            connection.release();
            // 删除临时文件
            fs.unlink(req.file.path, () => { });
        }
    });
};

// 清空商品数据
export const clearProducts = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        // 删除所有订单项
        await connection.query('DELETE FROM order_item');

        // 删除所有订单
        await connection.query('DELETE FROM `order`');

        // 删除所有商品规格
        await connection.query('DELETE FROM product_spec');

        // 删除所有商品
        await connection.query('DELETE FROM product');

        // 删除所有购物车
        await connection.query('DELETE FROM cart');

        // 重置自增ID
        await connection.query('ALTER TABLE product_spec AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE product AUTO_INCREMENT = 1');

        await connection.commit();

        return res.json(createResponse(200, "success", null, "商品及其相关内容已清空"));
    } catch (error) {
        await connection.rollback();
        console.error("清空商品数据失败:", error);
        return res.status(500).json(createResponse(500, "error", null, "清空商品数据失败"));
    } finally {
        connection.release();
    }
}; 