import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocument schema for each item in a bill
const billItemSchema = new Schema({
  name: { type: String, required: true },
  size: { type: String, enum: ["half", "full"], required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

// Main Bill schema
const billSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    items: [billItemSchema], // Array of items
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

// ------------------- ADMIN STATIC METHODS -------------------

// Add new items to bill
billSchema.statics.addItems = async function (billId, newItems) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  bill.items.push(...newItems);
  const addedTotal = newItems.reduce((sum, item) => sum + item.total, 0);
  bill.total += addedTotal;

  await bill.save();
  return bill;
};

// Update a specific item in bill
billSchema.statics.updateItem = async function (billId, itemId, updatedFields) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  const item = bill.items.id(itemId);
  if (!item) throw new Error("Item not found");

  Object.assign(item, updatedFields);

  // Recalculate total
  bill.total = bill.items.reduce((sum, i) => sum + i.total, 0);

  await bill.save();
  return bill;
};

// Delete a specific item from bill
billSchema.statics.deleteItem = async function (billId, itemId) {
  const bill = await this.findById(billId);
  if (!bill) throw new Error("Bill not found");

  const item = bill.items.id(itemId);
  if (!item) throw new Error("Item not found");

  item.remove();

  // Recalculate total
  bill.total = bill.items.reduce((sum, i) => sum + i.total, 0);

  await bill.save();
  return bill;
};

const Bill = model("Bill", billSchema);
export default Bill;
