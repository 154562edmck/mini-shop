import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
    getOrders,
    updateOrder,
    deleteOrder,
    generateShareLink
} from "../controllers/orderController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getOrders);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.post("/:id/share", generateShareLink);

export default router; 