const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: ["bug", "suggestion", "complaint", "compliment", "other"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "resolved", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    adminResponse: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm
feedbackSchema.index({ user: 1, status: 1 });
feedbackSchema.index({ type: 1, priority: 1 });

const FeedbackModel = mongoose.model("feedbacks", feedbackSchema);
module.exports = FeedbackModel;
