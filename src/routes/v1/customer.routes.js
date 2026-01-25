import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../controllers/customer.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// Admin-only routes
router.use(verifyAdmin);

router.get("/", getAllCustomers);        // Get all customers
router.get("/:id", getCustomerById);     // Get customer by ID
router.post("/", createCustomer);        // Create new customer
router.put("/:id", updateCustomer);      // Update customer
router.delete("/:id", deleteCustomer);   // Delete customer

export default router;
