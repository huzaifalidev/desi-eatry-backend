import User from "../models/user.model.js";
import Bill from "../models/bill.model.js";
import Payment from "../models/payment.model.js";

// Create USER (Customer)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ msg: "Phone already exists" });
    }
    const user = await User.create({
      firstName,
      lastName,
      phone,
      address,
      role: "CUSTOMER",
      isActive: true,
      summary: {
        totalBilled: 0,
        totalPaid: 0,
        balance: 0,
      },
    });
    res.status(201).json({ msg: "User created", user });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
// Update USER (Customer)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "CUSTOMER",
      deletedAt: { $exists: false },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // ❌ NEVER update summary from request
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({ msg: "User updated", user });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
// Get ALL USERS (Customers)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "CUSTOMER",
      deletedAt: { $exists: false },
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// Get SINGLE USER (Customer)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "CUSTOMER",
      deletedAt: { $exists: false },
    }).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Fetch bills & payments separately
    const bills = await Bill.find({ customerId: user._id });
    const payments = await Payment.find({ customerId: user._id });

    res.status(200).json({
      user,
      bills,
      payments,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// Soft DELETE USER (Customer)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "CUSTOMER",
      deletedAt: { $exists: false },
    });

    if (!user)
      return res.status(404).json({ msg: "User not found or already deleted" });

    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({ msg: "User soft-deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
