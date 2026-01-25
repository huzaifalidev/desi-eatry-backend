import Bill from "../models/bill.model.js";
import User from "../models/user.model.js";

export const createBill = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId) return res.status(400).json({ msg: "Customer ID is required" });
    if (!items || items.length === 0) return res.status(400).json({ msg: "No items provided" });

    // Calculate total
    const billItems = items.map(item => ({
      menuId: item.menuId,
      name: item.name,
      size: item.size,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }));

    const totalAmount = billItems.reduce((sum, i) => sum + i.total, 0);

    // 1️⃣ Create the bill
    const bill = await Bill.create({
      customerId,
      items: billItems,
      total: totalAmount,
    });

    // 2️⃣ Update the customer
    await User.findByIdAndUpdate(customerId, {
      $push: { bills: bill._id }, // push ONLY the ID
      $inc: {
        "summary.totalBilled": totalAmount,
        "summary.balance": totalAmount,
      },
    });

    return res.status(201).json({ msg: "Bill created successfully", bill });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
