import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Payment Schema
const paymentSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "Other"],
      default: "Cash",
    },
    note: { type: String }, // Optional note about payment
  },
  { timestamps: true }
);

// ------------------- ADMIN STATIC METHODS -------------------

// Create a payment and update customer's summary
paymentSchema.statics.recordPayment = async function (customerId, paymentData) {
  const customer = await mongoose.model("User").findById(customerId);
  if (!customer) throw new Error("Customer not found");

  const payment = await this.create({ customerId, ...paymentData });

  // Link payment and update summary
  customer.payments.push(payment._id);
  customer.summary.totalPaid += payment.amount;
  customer.summary.balance = customer.summary.totalBilled - customer.summary.totalPaid;
  await customer.save();

  return payment;
};

// Delete payment and adjust customer summary
paymentSchema.statics.deletePayment = async function (paymentId) {
  const payment = await this.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  const customer = await mongoose.model("User").findById(payment.customerId);
  if (!customer) throw new Error("Customer not found");

  // Remove payment reference
  customer.payments = customer.payments.filter(
    (p) => p.toString() !== payment._id.toString()
  );
  customer.summary.totalPaid -= payment.amount;
  customer.summary.balance = customer.summary.totalBilled - customer.summary.totalPaid;
  await customer.save();

  await payment.deleteOne();

  return payment;
};

const Payment = model("Payment", paymentSchema);
export default Payment;
