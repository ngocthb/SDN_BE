const express = require("express");
const CommentController = require("../controller/CommentController.js");
const CommentRouter = express.Router();
const { authUserMiddleware } = require("../middleware/AuthMiddleware.js");

CommentRouter.post(
  "/create",
  authUserMiddleware,
  CommentController.createComment
);

CommentRouter.get("/:claim_id", CommentController.getComments);

CommentRouter.post(
  "/reply",
  authUserMiddleware,
  CommentController.replyComment
);

module.exports = CommentRouter;
