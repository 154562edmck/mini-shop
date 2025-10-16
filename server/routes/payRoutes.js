import express from "express";
import { getPayParams, handlePayCallback } from "../controllers/payController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * 获取支付参数
 * 微信支付无需记录用户信息、因此无需 authMiddleware 来验证用户
 */
router.post("/params", authMiddleware, getPayParams);

// 支付回调通知
router.all("/callback", handlePayCallback);

export default router; 