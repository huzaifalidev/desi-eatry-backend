import express from "express";
// import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import menuRoutes from "./menu.routes.js";
import userRoutes from "./user.routes.js";
import billRoutes from "./bill.routes.js";
import paymentRoutes from "./payment.routes.js";
import expenseRoutes from "./expense.routes.js";
const router = express.Router();

// router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/menus", menuRoutes);
router.use("/admin/users", userRoutes);
router.use("/admin/bill", billRoutes);
router.use("/admin/payment", paymentRoutes);
router.use("/admin/expense", expenseRoutes);

export default router;
