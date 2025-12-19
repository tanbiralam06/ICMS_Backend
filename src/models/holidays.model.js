import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate holidays on the same date?
// Overlap check is better handled in controller if needed.
// holidaySchema.index({ date: 1 }, { unique: true });

export default mongoose.model("Holiday", holidaySchema);
