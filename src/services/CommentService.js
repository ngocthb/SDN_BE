const CommentModel = require("../models/CommentsModel");
const UserModel = require("../models/UserModel");
const BlogModel = require("../models/BlogsModel");

exports.createComment = async (newComment) => {
  const { content, authorId, blogId } = newComment;

  if (!content || !authorId || !blogId) {
    throw new Error("Missing required fields: content, authorId, or blogId.");
  }

  if (content.length < 1 || content.length > 500) {
    throw new Error("Content must be between 1 and 500 characters.");
  }

  const checkUser = await UserModel.findById(authorId);
  if (!checkUser) {
    throw new Error("Author not found.");
  }

  const checkBlog = await BlogModel.findById(blogId);
  if (!checkBlog) {
    throw new Error("Blog not found.");
  }

  try {
    const result = await CommentModel.create(newComment);
    return result;
  } catch (error) {
    throw error;
  }
};
