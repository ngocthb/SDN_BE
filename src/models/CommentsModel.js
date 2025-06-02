const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    }, // Nội dung bình luận
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người viết bình luận
    communityPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "communityPosts",
      required: true,
    }, // Bài viết mà bình luận thuộc về
    likes: {
      type: Number,
      default: 0,
      min: 0,
    }, // Số lượt thích bình luận
  },
  {
    timestamps: true,
  }
);

const CommentsModel = mongoose.model("comments", commentsSchema);
module.exports = CommentsModel;
