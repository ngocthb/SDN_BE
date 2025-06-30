const BlogController = require("../controller/BlogController");
const express = require("express");
const BlogRouter = express.Router();
const {authCoachOrAdminMiddleware} = require("../middleware/authMiddleware");

BlogRouter.post("/create", BlogController.createBlog);

module.exports = BlogRouter;
