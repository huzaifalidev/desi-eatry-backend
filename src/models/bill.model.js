// models/bill.model.js
import mongoose from "mongoose";
import User from "./user.model.js";

const { Schema, model } = mongoose;

const billItemSchema = new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: "Menu" },
  name: String,
  size: { type: String, enum: ["half", "full"] },
  unit: String,
  quantity: Number,
  price: Number,
  total: Number,
});

const billSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [billItemSchema],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// CREATE BILL
billSchema.statics.createBill = async function (customerId, items) {
  const preparedItems = items.map(i => ({
    ...i,
    total: i.price * i.quantity,
  }));

  const total = preparedItems.reduce((s, i) => s + i.total, 0);

  const bill = await this.create({
    customerId,
    items: preparedItems,
    total,
  });

  await User.findByIdAndUpdate(customerId, {
    $inc: {
      "summary.totalBilled": total,
      "summary.balance": total,
    },
  });

  return bill;
};

// DELETE BILL
billSchema.statics.deleteBill = async function (billId) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  await User.findByIdAndUpdate(bill.customerId, {
    $inc: {
      "summary.totalBilled": -bill.total,
      "summary.balance": -bill.total,
    },
  });

  await bill.deleteOne();
};

export default model("Bill", billSchema);
