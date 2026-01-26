// controllers/payment.controller.js
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

/* =========================================
   CREATE PAYMENT
========================================= */
export const createPayment = async (req, res) => {
  try {
    const { customerId, billId, amount, method, note, date } = req.body;

    if (!customerId || !amount)
      return res.status(400).json({ msg: "Customer and amount required" });

    const payment = await Payment.create({
      customerId,
      billId,
      amount,
      method,
      note,
      date: date || new Date(),
    });

    // Update customer summary
    await User.findByIdAndUpdate(customerId, {
      $inc: {
        "summary.totalPaid": amount,
        "summary.balance": -amount,
      },
    });

    res.status(201).json({ msg: "Payment added", payment });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* =========================================
   GET ALL PAYMENTS
========================================= */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customerId", "firstName lastName phone")
      .populate("billId", "total date")
      .sort({ date: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* =========================================
   GET PAYMENTS BY CUSTOMER
========================================= */
export const getPaymentsByCustomer = async (req, res) => {
  try {
    const payments = await Payment.find({
      customerId: req.params.customerId,
    }).sort({ date: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* =========================================
   DELETE PAYMENT (Rollback)
========================================= */
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    await User.findByIdAndUpdate(payment.customerId, {
      $inc: {
        "summary.totalPaid": -payment.amount,
        "summary.balance": payment.amount,
      },
    });

    await payment.deleteOne();

    res.status(200).json({ msg: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
