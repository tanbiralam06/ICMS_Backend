import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["TAX_INVOICE", "PROFORMA"],
      default: "TAX_INVOICE",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },

    // Customer Details
    customerName: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    customerGstin: {
      type: String,
    },
    placeOfSupply: {
      type: String,
    },

    // Line Items
    items: [
      {
        description: { type: String, required: true },
        hsnCode: { type: String },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        discountType: {
          type: String,
          enum: ["FLAT", "PERCENTAGE"],
          default: "FLAT",
        },
        discountValue: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        amount: { type: Number, required: true }, // Net Amount (after item discount)
      },
    ],

    // Financials
    subTotal: { type: Number, required: true }, // Before Tax
    discountType: {
      type: String,
      enum: ["FLAT", "PERCENTAGE"],
      default: "FLAT",
    },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 }, // Percentage (e.g., 18)
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // Grand Total
    amountInWords: { type: String },

    status: {
      type: String,
      enum: ["Draft", "Issued", "Paid", "Cancelled"],
      default: "Issued",
    },

    // Snapshot of Company Profile at time of creation
    companyProfileSnapshot: {
      companyName: String,
      companyId: String, // CIN
      address: String,
      gstin: String,
      taxId: String,
      bankName: String,
      accountHolderName: String, // Added
      accountNumber: String,
      ifscCode: String,
      swiftCode: String, // Added
      branch: String,
      logoUrl: String, // Store the path to the logo
      signatoryName: String,
      signatureUrl: String,
      termsUrl: String, // Added
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
