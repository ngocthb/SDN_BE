const mongoose = require("mongoose");

//chi co admin hoac coach moi duoc tao bai viet
const blogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    }, // Tiêu đề bài viết
    content: {
      type: String,
      required: true,
    }, // Nội dung bài viết
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người viết bài

    imageUrl: {
      type: String,
      required: false,
    }, // URL hình ảnh đại diện cho bài viết
  },
  {
    timestamps: true,
  }
);
const BlogsModel = mongoose.model("blogs", blogsSchema);
module.exports = BlogsModel;
