const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người dùng đăng bài
    content: {
      type: String,
      required: true,
    }, // Nội dung bài viết
    imageUrl: {
      type: String,
      required: false,
    }, // URL hình ảnh đính kèm (nếu có)
    likes: {
      type: Number,
      default: 0,
      min: 0,
    }, // Số lượt thích
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    }, // Số lượng bình luận
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const CommunityPostsModel = mongoose.model(
  "communityPosts",
  communityPostSchema
);
module.exports = CommunityPostsModel;
