import mongoose from "mongoose";

const documentLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["VIEW", "DOWNLOAD"],
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt acts as the event timestamp
  },
);

// Index for fast lookup of logs per document
documentLogSchema.index({ documentId: 1, createdAt: -1 });

const DocumentLog = mongoose.model("DocumentLog", documentLogSchema);

export default DocumentLog;
