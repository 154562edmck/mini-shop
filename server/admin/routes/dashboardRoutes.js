import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(requireAuth);
router.get("/stats", getDashboardStats);

export default router; 