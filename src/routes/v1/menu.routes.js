import express from "express";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";
import * as menu from "../../controllers/menu.controller.js";

const router = express.Router();

router.post("/", verifyAdmin, menu.createMenu);
router.get("/", menu.getMenus);
router.get("/:id", menu.getMenuById);
router.put("/:id", verifyAdmin, menu.updateMenu);
router.delete("/:id", verifyAdmin, menu.deleteMenu);
export default router;
