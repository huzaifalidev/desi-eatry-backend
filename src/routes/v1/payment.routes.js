// routes/payment.routes.js
import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentsByCustomer,
  deletePayment,
} from "../../controllers/payment.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/",verifyAdmin(), createPayment);
router.get("/", verifyAdmin(), getAllPayments);
router.get("/customer/:customerId", verifyAdmin(), getPaymentsByCustomer);
router.delete("/:id", verifyAdmin(), deletePayment);

export default router;
