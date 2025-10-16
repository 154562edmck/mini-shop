import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getConfigs, updateConfigSettings } from "../controllers/configController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getConfigs);
router.put("/:key", updateConfigSettings);

export default router; 