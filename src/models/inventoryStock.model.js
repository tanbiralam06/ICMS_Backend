import mongoose from "mongoose";

const inventoryStockSchema = new mongoose.Schema(
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
    presentUnits: {
      type: Number,
      required: true,
      min: 0,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by Unique ID
inventoryStockSchema.index({ uniqueId: 1 });

export default mongoose.model("InventoryStock", inventoryStockSchema);
