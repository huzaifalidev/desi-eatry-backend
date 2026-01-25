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

export const createBill = async (req, res) => {
  try {
    const { customerId, items, total } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Validate customer exists
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ msg: "Customer not found" });

    // Create the bill
    const bill = await Bill.create({
      customerId,
      items: items.map(item => ({
        menuId: item.menuId || null, // optional, if menu reference exists
        name: item.name,
        size: item.size,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price || (item.total / item.quantity), // store per-unit price
        total: item.total,
      })),
      total,
    });

    // Update customer: push bill and update summary
    customer.bills.push(bill._id);
    customer.summary.totalBilled = (customer.summary?.totalBilled || 0) + total;
    customer.summary.balance = (customer.summary?.balance || 0) + total;

    await customer.save();

    return res.status(201).json({ msg: "Bill created", bill });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
};
// Update customer

export const updateCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).where({ role: "CUSTOMER" });
    if (!customer) return res.status(404).json({ msg: "Customer not found" });

    // Update totals if sent
    if (req.body.totalBilled !== undefined) customer.summary.totalBilled = req.body.totalBilled
    if (req.body.totalPaid !== undefined) customer.summary.totalPaid = req.body.totalPaid
    if (req.body.balance !== undefined) customer.summary.balance = req.body.balance

    // Add new bill if sent
    if (req.body.bill) {
      customer.bills.push(req.body.bill)  // <-- push the object directly
    }

    // Update other fields normally
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) customer[field] = req.body[field]
    })

    await customer.save()
    res.status(200).json({ msg: "Customer updated", customer })
  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
}



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
