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
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    key: {
      // R2 object key (path inside bucket)
      type: String,
      required: true,
      unique: true,
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
      enum: ["active", "archived", "deleted"],
      default: "active",
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
