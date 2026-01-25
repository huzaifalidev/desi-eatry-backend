import mongoose from "mongoose";
import User from "./user.model.js";

const { Schema, model } = mongoose;

const billItemSchema = new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  size: { type: String, enum: ["half", "full"], required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const billSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    items: [billItemSchema],
    total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// ---------------- BILL STATIC METHODS ----------------

// 1️⃣ Create a new bill
billSchema.statics.createBill = async function (customerId, itemsData) {
  if (!customerId) throw new Error("customerId is required");
  if (!itemsData || !itemsData.length) throw new Error("No items provided");

  const items = itemsData.map((i) => ({
    menuId: i.menuId,
    name: i.name,
    size: i.size,
    unit: i.unit,
    quantity: i.quantity,
    price: i.price,
    total: i.price * i.quantity,
  }));

  const total = items.reduce((sum, i) => sum + i.total, 0);

  const bill = await this.create({ customerId, items, total });

  // Update User
  await User.findByIdAndUpdate(customerId, {
    $push: { bills: bill._id },
    $inc: { "summary.totalBilled": total, "summary.balance": total },
  });

  return bill;
};

// 2️⃣ Add items to existing bill
billSchema.statics.addItems = async function (billId, newItemsData) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  const newItems = newItemsData.map((i) => ({
    menuId: i.menuId,
    name: i.name,
    size: i.size,
    unit: i.unit,
    quantity: i.quantity,
    price: i.price,
    total: i.price * i.quantity,
  }));

  const addedTotal = newItems.reduce((sum, i) => sum + i.total, 0);

  bill.items.push(...newItems);
  bill.total += addedTotal;
  await bill.save();

  await User.findByIdAndUpdate(bill.customerId, {
    $inc: { "summary.totalBilled": addedTotal, "summary.balance": addedTotal },
  });

  return bill;
};

// 3️⃣ Update a bill item
billSchema.statics.updateItem = async function (billId, itemId, updatedFields) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  const item = bill.items.id(itemId);
  if (!item) throw new Error("Item not found");

  const oldTotal = item.total;

  Object.assign(item, updatedFields);

  if (item.price && item.quantity) {
    item.total = item.price * item.quantity;
  }

  bill.total = bill.items.reduce((sum, i) => sum + i.total, 0);
  await bill.save();

  const delta = bill.total - (bill.total - oldTotal + item.total);
  await User.findByIdAndUpdate(bill.customerId, {
    $inc: { "summary.totalBilled": item.total - oldTotal, "summary.balance": item.total - oldTotal },
  });

  return bill;
};

// 4️⃣ Delete a bill item
billSchema.statics.deleteItem = async function (billId, itemId) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  const item = bill.items.id(itemId);
  if (!item) throw new Error("Item not found");

  const itemTotal = item.total;
  item.remove();

  bill.total = bill.items.reduce((sum, i) => sum + i.total, 0);
  await bill.save();

  await User.findByIdAndUpdate(bill.customerId, {
    $inc: { "summary.totalBilled": -itemTotal, "summary.balance": -itemTotal },
  });

  return bill;
};

const Bill = model("Bill", billSchema);
export default Bill;
