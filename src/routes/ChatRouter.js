const express = require("express");
const ChatController = require("../controller/ChatController.js");
const {
  authUserMiddleware,
  authCoachMiddleware,
} = require("../middleware/authMiddleware");

const ChatRouter = express.Router();

ChatRouter.route("/").post(ChatController.createChat);
