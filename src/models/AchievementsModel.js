const mongoose = require("mongoose");

// bang luu cac thanh tuu ma nguoi dung co the dat duoc
const AchievementsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    }, // Tên thành tựu
    description: {
      type: String,
      required: true,
    }, // Mô tả thành tựu
    icon: {
      type: String,
      required: true,
    }, // Biểu tượng đại diện cho thành tựu
    points: {
      type: Number,
      required: true,
      min: 0,
    }, // Số điểm thưởng khi đạt được thành tựu
  },
  {
    timestamps: true,
  }
);

const AchievementsModel = mongoose.model("achievements", AchievementsSchema);
module.exports = AchievementsModel;
