const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    aspectRated: {
      type: String,
      enum: [
        "overall",
        "features",
        "coach-quality",
        "content",
        "user-interface",
        "support",
      ],
      default: "overall",
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    // Có thể link với gói thành viên user đang dùng
    membershipPackage: {
      type: String,
      enum: ["free", "basic", "premium", "vip"],
    },
    // Số ngày đã sử dụng app khi rating
    daysUsed: {
      type: Number,
      default: 0,
    },
    // User có recommend app không
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tránh user rating nhiều lần trong ngày
ratingSchema.index({ user: 1, createdAt: 1 });

// Method để check user đã rating trong vòng 30 ngày chưa
ratingSchema.statics.hasRecentRating = async function (userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRating = await this.findOne({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo },
  });

  return !!recentRating;
};

const RatingModel = mongoose.model("ratings", ratingSchema);
module.exports = RatingModel;
