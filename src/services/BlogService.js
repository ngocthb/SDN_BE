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

  if (imageUrl && imageUrl.trim()) {
    const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png|gif|svg)/i;
    if (!imageRegex.test(imageUrl.trim())) {
      throw new Error(
        "Image URL must be a valid image link (.jpg, .png, .gif, .svg)"
      );
    }
  }

  // Tạo blog
  const newBlog = await BlogModel.create({
    title: title.trim(),
    content: content.trim(),
    authorId: authorId.trim(),
    imageUrl: imageUrl?.trim() || null,
  });

  return newBlog;
};
