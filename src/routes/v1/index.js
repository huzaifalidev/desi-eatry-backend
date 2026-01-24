import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import menuRoutes from "./menu.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/menu", menuRoutes);

export default router;