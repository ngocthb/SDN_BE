const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    }, // Nội dung bình luận
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người viết bình luận
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogs",
      required: true,
    }, // Bài viết mà bình luận thuộc về
  },
  {
    timestamps: true,
  }
);

const CommentsModel = mongoose.model("comments", commentsSchema);
module.exports = CommentsModel;
