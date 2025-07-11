const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "memberships",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentId: { type: String, required: true }, // id giao dich thanh toan
  },
  {
    timestamps: true,
  }
);
const SubscriptionModel = mongoose.model("subscriptions", subscriptionSchema);
module.exports = SubscriptionModel;
