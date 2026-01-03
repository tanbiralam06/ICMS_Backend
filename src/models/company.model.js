import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Company Information
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      // CIN
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String, // Path to the uploaded logo file
    },

    // Signatory Information
    signatoryName: {
      type: String,
      required: true,
    },
    signatureUrl: {
      type: String, // Path to the uploaded signature file
    },

    // Bank Details
    bankName: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    bankAddress: {
      type: String,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    swiftCode: {
      type: String,
    },

    // Terms & Conditions
    termsUrl: {
      type: String, // URL or path to T&C document if needed, or we might want a text field? Sticking to plan.
    },
  },
  {
    timestamps: true,
  },
);

// Create a standalone model. We will enforce singleton logic in the controller.
const CompanyProfile = mongoose.model("CompanyProfile", companySchema);

export default CompanyProfile;
