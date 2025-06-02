const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người dùng đã thích
    communityPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "communityPosts",
      required: true,
    },
    isLiked: {
      type: Boolean,
      default: false, // Mặc định là đã chua thích
    }, // Trạng thái thích (true hoặc false)
  },
  {
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);

const LikesModel = mongoose.model("likes", likesSchema);
module.exports = LikesModel;
