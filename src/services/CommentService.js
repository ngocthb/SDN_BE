const CommentModel = require("../models/CommentsModel");
const UserModel = require("../models/UserModel");
const BlogModel = require("../models/BlogsModel");
const mongoose = require("mongoose");

exports.validateComment = async (data) => {
  const { content, authorId, blogId } = data;

  if (!content || !content.trim()) {
    throw new Error("Content is required.");
  }
  if (content.trim().length < 1 || content.trim().length > 500) {
    throw new Error("Content must be between 1 and 500 characters.");
  }

  if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
    throw new Error("Invalid authorId.");
  }
  const authorExists = await UserModel.findById(authorId);
  if (!authorExists) {
    throw new Error("Author does not exist.");
  }

  if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("Invalid blogId.");
  }
  const blogExists = await BlogModel.findById(blogId);
  if (!blogExists) {
    throw new Error("Blog does not exist.");
  }
};

exports.createComment = async (data) => {
  const newComment = await CommentModel.create({
    content: data.content.trim(),
    authorId: data.authorId,
    blogId: data.blogId,
  });

  return newComment;
};
