const BlogController = require("../controller/BlogController");
const express = require("express");
const BlogRouter = express.Router();

BlogRouter.post("/create", BlogController.createBlog);

module.exports = BlogRouter;
