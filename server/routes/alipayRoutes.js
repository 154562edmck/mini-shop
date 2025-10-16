import express from 'express';
import { getPayParams, handlePayCallback } from '../controllers/alipayController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * 获取支付参数
 * 支付宝无需记录用户信息、因此无需 authMiddleware 来验证用户
 */
router.post('/params', getPayParams);

// 支付回调通知
router.all('/callback', handlePayCallback);

export default router; 