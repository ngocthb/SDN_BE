const express = require("express");
const ChatController = require("../controller/ChatController.js");
const { authUserMiddleware } = require("../middleware/authMiddleware");

const ChatRouter = express.Router();

ChatRouter.route("/").post(authUserMiddleware, ChatController.createChat);
ChatRouter.route("/").get(authUserMiddleware, ChatController.getChat);

module.exports = ChatRouter;
