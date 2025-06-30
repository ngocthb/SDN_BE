const BlogModel = require("../models/BlogsModel");
const UserModel = require("../models/UserModel");

exports.createBlog = async (newBlog) => {
  try {
    const { authorId, title, content } = newBlog;

    if (!authorId || !title || !content) {
      throw new Error("Missing required fields.");
    }

    const checkUser = await UserModel.findById(authorId);

    if (!checkUser) {
      throw new Error("Author not found.");
    }

    const result = await BlogModel.create(newBlog);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
