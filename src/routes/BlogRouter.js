const BlogController = require("../controller/BlogController");
const express = require("express");
const BlogRouter = express.Router();
const { authUserMiddleware } = require("../middleware/authMiddleware");

BlogRouter.use(authUserMiddleware);
BlogRouter.post("/create", BlogController.createBlog);

module.exports = BlogRouter;
