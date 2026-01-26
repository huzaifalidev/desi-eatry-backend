import express from "express";
import {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} from "../../controllers/user.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// Admin-only routes


router.get("/", verifyAdmin(), getAllUsers); // Get all customers
router.get("/:id" , verifyAdmin(), getUserById); // Get customer by ID
router.post("/", verifyAdmin(), createUser); // Create new customer
router.put("/:id", verifyAdmin(), updateUser); // Update customer
router.delete("/:id", verifyAdmin(), deleteUser); // Delete customer

export default router;
