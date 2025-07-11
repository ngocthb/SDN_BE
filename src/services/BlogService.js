const BlogModel = require("../models/BlogsModel");
const UserModel = require("../models/UserModel");
const mongoose = require("mongoose");

exports.createBlog = async (dataRequest) => {
  const { title, content, authorId, imageUrl } = dataRequest;

  // Validate logic cơ bản
  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }
  if (title.trim().length < 5) {
    throw new Error("Title must be at least 5 characters");
  }

  if (!content || !content.trim()) {
    throw new Error("Content is required");
  }
  if (content.trim().length < 20) {
    throw new Error("Content must be at least 20 characters");
  }

  if (!authorId || !authorId.trim()) {
    throw new Error("Author ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(authorId.trim())) {
    throw new Error("Author ID is not valid");
  }

  const authorExists = await UserModel.findById(authorId.trim());
  if (!authorExists) {
    throw new Error("Author does not exist");
  }

  // KHÔNG CẦN VALIDATE IMAGEURL NỮA vì multer đã xử lý

  // Tạo blog
  const newBlog = await BlogModel.create({
    title: title.trim(),
    content: content.trim(),
    authorId: authorId.trim(),
    imageUrl: imageUrl || null, // imageUrl bây giờ là đường dẫn file trên server
  });

  return newBlog;
};

exports.getAllBlogs = async ({ skip = 0, limit = 5 }) => {
  const blogs = await BlogModel.find()
    .sort({ createdAt: -1 }) // mới nhất trước
    .skip(skip)
    .limit(limit)
    .populate({
      path: "authorId",
      select: "name picture", // optional: lấy tên và ảnh người viết
    })
    .lean();

  return blogs;
};

exports.deleteBlog = async (blogId) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("Invalid blog ID");
  }

  const deleted = await BlogModel.findByIdAndDelete(blogId);

  if (!deleted) {
    throw new Error("Blog not found or already deleted");
  }

  return { message: "Blog deleted successfully" };
};
