const mongoose = require("mongoose");

// ghi nhan tinh trang thai hut thuoc cua nguoi dung hien tai
const smokingStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    cigarettesPerDay: {
      type: Number,
      required: true,
      min: 0,
    }, // So luong thuoc hut moi ngay
    pricePerCigarette: {
      type: Number,
      required: true,
      min: 0,
    }, // Gia tien moi dieu thuoc
  },
  {
    timestamps: true,
  }
);

const SmokingStatusModel = mongoose.model("smokingStatus", smokingStatusSchema);
module.exports = SmokingStatusModel;
