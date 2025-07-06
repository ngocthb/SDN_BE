const express = require("express");
const {
  authUserMiddleware,
  authCoachMiddleware,
} = require("../middleware/authMiddleware");
const ChatController = require("../controller/ChatController.js");
const CoachRouter = express.Router();

CoachRouter.get(
  "/",
  authUserMiddleware,
  authCoachMiddleware,
  ChatController.getAllChats
);

CoachRouter.get(
  "/:chatId",
  authUserMiddleware,
  authCoachMiddleware,
  ChatController.getChatById
);

CoachRouter.post(
  "/:chatId",
  authUserMiddleware,
  authCoachMiddleware,
  ChatController.sendMessageToUser
);

module.exports = CoachRouter;
