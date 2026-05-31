import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
      // Optional for external URLs
    },
    mimeType: {
      type: String,
      // Optional for external URLs
    },
    size: {
      type: Number,
      // Optional for external URLs
    },
    key: {
      // R2 object key (path inside bucket)
      type: String,
      unique: true,
      sparse: true,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      trim: true,
    },
    allowedViewers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    category: {
      type: String,
      enum: [
        "Policy",
        "Invoice",
        "EmployeeRecord",
        "Contract",
        "Report",
        "TaskAttachment",
        "Inventory",
        "Other",
      ],
      default: "Other",
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "active", "archived", "deleted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast queries
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ tags: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
