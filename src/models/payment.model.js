// models/payment.model.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },

    note: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model("Payment", paymentSchema);
