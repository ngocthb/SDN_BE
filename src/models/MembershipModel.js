const mongoose = require("mongoose");

// bang nay luu cac goi dich vu nguoi dung co the dang ky
const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // tinh theo ngay
    description: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const MembershipModel = mongoose.model("memberships", membershipSchema);
module.exports = MembershipModel;
