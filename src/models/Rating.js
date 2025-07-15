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
    // Reference đến subscription hiện tại của user khi rating
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptions",
      default: null, // null cho free user
    },
    // Giữ lại field cũ để backward compatibility (optional)
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

// // Virtual để lấy membership type từ subscription
// ratingSchema.virtual("membershipType").get(function () {
//   if (!this.subscription || !this.subscription.membershipId) {
//     return this.membershipPackage || "free";
//   }
//   return this.subscription.membershipId.type || "free";
// });

// // Virtual để lấy membership name
// ratingSchema.virtual("membershipName").get(function () {
//   if (!this.subscription || !this.subscription.membershipId) {
//     return this.membershipPackage || "Free";
//   }
//   return this.subscription.membershipId.name || "Free";
// });

// Virtual để check subscription có active không
ratingSchema.virtual("isSubscriptionActive").get(function () {
  if (!this.subscription) return false;
  const currentDate = new Date();
  return (
    this.subscription.status === "active" &&
    this.subscription.startDate <= currentDate &&
    this.subscription.endDate >= currentDate
  );
});

// Ensure virtual fields are serialized
ratingSchema.set("toJSON", { virtuals: true });
ratingSchema.set("toObject", { virtuals: true });

const RatingModel = mongoose.model("ratings", ratingSchema);
module.exports = RatingModel;
