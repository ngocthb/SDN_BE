const commentService = require("../services/CommentService");

exports.createComment = async (req, res) => {
  try {
    const { content, authorId, blogId } = req.body;

    // Gọi service để validate
    await commentService.validateComment({ content, authorId, blogId });

    // Nếu validate qua, tạo comment
    const newComment = await commentService.createComment({
      content,
      authorId,
      blogId,
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
