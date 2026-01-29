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
router.use(verifyAdmin());
router.post("/", createMenu);
router.get("/", getMenus);
router.get("/:id", getMenuById);
router.put("/:id", updateMenu);
router.delete("/:id", deleteMenu);
export default router;
