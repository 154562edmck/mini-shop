import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    exportProducts,
    importProducts,
    clearProducts
} from "../controllers/productController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getProducts);
router.post("/", addProduct);
router.get("/export", exportProducts);
router.post("/import", importProducts);
router.delete("/clear", clearProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router; 