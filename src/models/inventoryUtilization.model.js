import mongoose from "mongoose";

const inventoryUtilizationSchema = new mongoose.Schema(
  {
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryReceipt",
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
      trim: true,
    },
    utilizedUnits: {
      type: Number,
      required: true,
      min: 0,
    },
    utilizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    locationAtUsage: {
      type: String,
      trim: true,
    },
    usageDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "InventoryUtilization",
  inventoryUtilizationSchema
);
