import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import menuRoutes from "./menu.routes.js";
import customerRoutes from "./customer.routes.js";
import billRoutes from "./bill.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/menu", menuRoutes);
router.use("/customer", customerRoutes);
router.use("/bill", billRoutes);

export default router;