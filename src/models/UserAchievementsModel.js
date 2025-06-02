const mongoose = require("mongoose");

// bang luu cac thanh tuu ma nguoi dung da dat duoc
const userAchievementsSchema = new mongoose.Schema(
  {
    _id: false, // Bo id mac dinh o bang nay
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "achievements",
      required: true,
    }, // Ma thanh tuu
    dateAchieved: {
      type: Date,
      default: Date.now, // Ngay dat duoc thanh tuu
    },
  },
  {
    timestamps: true, // Tu dong luu thoi gian tao va cap nhat
  }
);

const UserAchievementsModel = mongoose.model(
  "userAchievements",
  userAchievementsSchema
);
module.exports = UserAchievementsModel;
