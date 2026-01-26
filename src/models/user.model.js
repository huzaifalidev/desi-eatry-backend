// models/user.model.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const summarySchema = new Schema(
  {
    totalBilled: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,

    email: {
      type: String,
      required() {
        return this.role !== "CUSTOMER";
      },
    },

    password: String,

    role: {
      type: String,
      enum: ["ADMIN", "STAFF", "CUSTOMER"],
      default: "CUSTOMER",
    },

    phone: { type: String, required: true, unique: true },
    address: String,
    deletedAt: Date,
    summary: { type: summarySchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    resetToken: { type: String },
  },
  { timestamps: true },
);

export default model("User", userSchema);
