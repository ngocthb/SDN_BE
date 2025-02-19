const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    date: { type: Date, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
      default: "67b0b2bc9e5c638ab1523c81",
    },
    total_no_of_hours: { type: Number, required: true },
    attached_file: { type: String, required: false },
    reason_claimer: { type: String, required: false },
    reason_approver: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const ClaimModel = mongoose.model("claims", claimSchema);
module.exports = ClaimModel;
