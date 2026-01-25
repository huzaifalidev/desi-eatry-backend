import User from "../models/user.model.js";
import Bill from "../models/bill.model.js";
import Payment from "../models/payment.model.js";

// Create customer
export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ msg: "Phone already exists" });
    const customer = await User.create({
      firstName,
      phone,
      lastName,
      address,
      role: "CUSTOMER",
      isActive: true,
      summary: { totalBilled: 0, totalPaid: 0, balance: 0 },
    });

    res.status(201).json({ msg: "Customer created", customer });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).where({ role: "CUSTOMER" });
    if (!customer) return res.status(404).json({ msg: "Customer not found" });

    Object.assign(customer, req.body); // Update allowed fields
    await customer.save();

    res.status(200).json({ msg: "Customer updated", customer });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Get all customers (exclude soft-deleted)
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "CUSTOMER", deletedAt: { $exists: false } })
      .select("-password");
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get single customer (exclude soft-deleted)
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "CUSTOMER", deletedAt: { $exists: false } })
      .populate("bills")
      .populate("payments")
      .select("-password");

    if (!customer) return res.status(404).json({ msg: "Customer not found" });

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Soft delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "CUSTOMER", deletedAt: { $exists: false } });
    if (!customer) return res.status(404).json({ msg: "Customer not found or already deleted" });
    customer.isActive = false;
    customer.deletedAt = new Date();
    await customer.save();

    // Optionally: soft delete bills and payments
    await Bill.updateMany({ customerId: customer._id }, { deletedAt: new Date() });
    await Payment.updateMany({ customerId: customer._id }, { deletedAt: new Date() });

    res.status(200).json({ msg: "Customer soft-deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
