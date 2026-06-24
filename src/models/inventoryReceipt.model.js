import mongoose from "mongoose";

const inventoryReceiptSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    contactPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    materialName: {
      type: String,
      required: true,
      trim: true,
    },
    totalUnits: {
      type: Number,
      required: true,
      min: 0,
    },
    unitType: {
      type: String,
      default: "Units",
      trim: true,
    },
    invoiceAmount: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    poDate: {
      type: Date,
    },
    poNumber: {
      type: String,
      trim: true,
    },
    miscellaneous: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InventoryReceipt", inventoryReceiptSchema);
