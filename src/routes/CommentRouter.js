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

/**
 * @swagger
 * /comment/update:
 *   put:
 *     summary: Cập nhật trạng thái bình luận
 *     description: Cập nhật trạng thái của nhiều bình luận bằng ID.
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["67e383f993db5e14cf9289bd", "67e36ebaa134cd1f658e2f51"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Thành công, bình luận đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Successfully updated comments"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "67e383f993db5e14cf9289bd"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       404:
 *         description: Không tìm thấy bình luận để cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "No comments found to update"
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

CommentRouter.put("/update", CommentController.updateComment);

CommentRouter.post(
  "/reply",
  authUserMiddleware,
  CommentController.replyComment
);

module.exports = CommentRouter;
