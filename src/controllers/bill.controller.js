import Bill from "../models/bill.model.js";
import User from "../models/user.model.js";

export const createBill = async (req, res) => {
  try {
    const { customerId, items, date } = req.body;

    if (!customerId)
      return res.status(400).json({ msg: "Customer ID is required" });

    if (!items || items.length === 0)
      return res.status(400).json({ msg: "No items provided" });

    // Prepare items
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

    // ✅ Create bill with OPTIONAL date
    const bill = await Bill.create({
      customerId,
      items: billItems,
      total: totalAmount,
      ...(date && { date: new Date(date) }), // 👈 key line
    });

    // Update customer summary
    await User.findByIdAndUpdate(customerId, {
      $inc: {
        "summary.totalBilled": totalAmount,
        "summary.balance": totalAmount,
      },
    });

    return res.status(201).json({
      msg: "Bill created successfully",
      bill,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
// GET ALL BILLS
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("customerId", "firstName lastName phone")
      .populate("items.menuId", "name half full unit")
      .sort({ date: -1 });

    res.status(200).json({ bills ,msg:"Bills fetched"});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// GET BILL BY ID
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("customerId", "firstName lastName phone")
      .populate("items.menuId", "name half full unit");

    if (!bill) return res.status(404).json({ msg: "Bill not found" });

    res.status(200).json({ bill, msg: "Bill fetched" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
