import express from "express";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";
import * as menu from "../../controllers/menu.controller.js";

const router = express.Router();

router.post("/", menu.createMenu);
router.get("/", menu.getMenus);
router.get("/:id", menu.getMenuById);
router.put("/:id",  menu.updateMenu);
router.delete("/:id", menu.deleteMenu);

export default router;
