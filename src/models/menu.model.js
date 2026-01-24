import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    half: {
      type: Number,
      default: 0
    },

    full: {
      type: Number,
      required: true
    },

    unit: {
      type: String,
      enum: ["plate", "glass", "bowl", "piece"],
      default: "plate"
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);
