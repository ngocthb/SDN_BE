const express = require("express");
const CommentController = require("../controller/CommentController.js");
const CommentRouter = express.Router();
const { authUserMiddleware } = require("../middleware/authMiddleware.js");

CommentRouter.post(
  "/create",
  authUserMiddleware,
  CommentController.createComment
);

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Lấy danh sách tất cả bình luận
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách bình luận
 *       401:
 *         description: Không có quyền truy cập
 */
CommentRouter.get("/", authUserMiddleware, CommentController.getAllComments);

CommentRouter.get("/:claim_id", CommentController.getComments);

CommentRouter.post(
  "/reply",
  authUserMiddleware,
  CommentController.replyComment
);

module.exports = CommentRouter;
