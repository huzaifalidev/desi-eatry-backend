import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocument for Bill Summary
const billSummarySchema = new Schema(
  {
    totalBilled: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstName: { type: String, },
    lastName: { type: String, },
    email: {
      type: String,
      required: function () {
        return this.role === "ADMIN" || this.role === "STAFF";
      }
    },
    password: { type: String },
    role: {
      type: String,
      enum: ["ADMIN", "STAFF", "CUSTOMER"],
      default: "CUSTOMER",
    },
    isActive: { type: Boolean, default: false },
    lastLogin: Date,
    deletedAt: Date,
    accessToken: String,
    refreshToken: String,
    resetToken: String,
    address: { type: String },
    phone: { type: String, unique: true, required: true },
    bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    summary: { type: billSummarySchema, default: {} },
  },
  { timestamps: true }
);

export default model("User", userSchema);
