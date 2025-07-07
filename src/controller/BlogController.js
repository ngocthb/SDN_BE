const BlogService = require("../services/BlogService");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, authorId, imageUrl } = req.body;

    if (!title || !title.trim() || !content || !content.trim() || !authorId || !authorId.trim()) {
      return res.status(400).json({
        status: "Err",
        message: "All fields are required except image URL",
      });
    }

    const newBlog = await BlogService.createBlog({ title, content, authorId, imageUrl });

    return res.status(201).json({
      status: "OK",
      data: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error.message);
    return res.status(400).json({
      status: "Err",
      message: error.message,
    });
  }
};
