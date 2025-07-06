const express = require("express");
const CommentRouter = express.Router();
const CommentController = require("../controller/CommentController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

CommentRouter.use(authUserMiddleware);
CommentRouter.post("/create", CommentController.createComment);

module.exports = CommentRouter;
