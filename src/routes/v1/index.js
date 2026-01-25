import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import menuRoutes from "./menu.routes.js";
import customerRoutes from "./customer.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/menu", menuRoutes);
router.use("/customer", customerRoutes);

export default router;