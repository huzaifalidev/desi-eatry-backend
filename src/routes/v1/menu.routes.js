import express from "express";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";
import {
    createMenu,
    getMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
} from "../../controllers/menu.controller.js";
const router = express.Router();

router.post("/", verifyAdmin(), createMenu);
router.get("/", getMenus);
router.get("/:id", getMenuById);
router.put("/:id", verifyAdmin(), updateMenu);
router.delete("/:id", verifyAdmin(), deleteMenu);
export default router;
