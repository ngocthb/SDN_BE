const commentService = require('../services/CommentService');

exports.createComment = async (req, res) => {
  try {
    const { content, authorId, blogId } = req.body;

    // Gọi hàm service
    const newComment = await commentService.createComment({ content, authorId, blogId });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      data: newComment,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
