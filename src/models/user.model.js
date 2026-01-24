import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentPhoneNumber: String,
    parentPhoneNumber: String,
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
    fees: String,
  },
  { timestamps: true }
);

export default model("User", userSchema);