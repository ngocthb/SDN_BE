const mongoose = require("mongoose");

const feedbacksSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const FeedbacksModel = mongoose.model("feedbacks", feedbacksSchema);
module.exports = FeedbacksModel;
