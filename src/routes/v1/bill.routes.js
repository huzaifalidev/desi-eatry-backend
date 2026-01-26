import express from "express";
import {
    createBill,
    getAllBills,
    getBillById,
} from "../../controllers/bill.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// Admin-only routes
router.post("/", verifyAdmin(),createBill);
router.get("/", verifyAdmin(),getAllBills);
router.get("/:id", verifyAdmin(),getBillById);
export default router;
