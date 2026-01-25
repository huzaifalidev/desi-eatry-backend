import express from "express";
import {
    createBill,
} from "../../controllers/bill.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// Admin-only routes
router.use(verifyAdmin);

router.post("/", createBill);        // Create new bill
export default router;
