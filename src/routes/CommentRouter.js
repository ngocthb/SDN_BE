const express = require("express")
const CommentRouter = express.Router();
const CommentController = require("../controller/CommentController")

CommentRouter.post("/create", CommentController.createComment);

module.exports = CommentRouter;