const BlogController = require("../controller/BlogController");
const express = require("express");
const BlogRouter = express.Router();
const { authUserMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

BlogRouter.use(authUserMiddleware);
BlogRouter.post("/create", upload.single("imageUrl"), BlogController.createBlog);

BlogRouter.post("/all", BlogController.getAllBlogs);

BlogRouter.delete("/:id", BlogController.deleteBlog);

module.exports = BlogRouter;
