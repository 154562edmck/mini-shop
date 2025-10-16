import express from "express";
import { getShareConfigs } from "../controllers/shareController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 获取分享配置
router.get("/configs", authMiddleware, getShareConfigs);

export default router; 