const ChatService = require("../services/ChatService.js");

const createChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        status: "ERR",
        message: "Message is required and must be a non-empty string.",
      });
    }
    const response = await ChatService.createChat(req.user.id, message);
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: "Have problem when creating chat. Please try again later.",
      });
    }

    return res.status(200).json({
      status: "OK",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: "ERR",
    });
  }
};

const getChat = async (req, res) => {
  try {
    const response = await ChatService.getChat(req.user.id);
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: message,
      });
    }

    return res.status(200).json({
      status: "OK",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "ERR",
    });
  }
};

const getAllChats = async (req, res) => {
  try {
    const response = await ChatService.getAllChats();
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: error.message,
      });
    }

    return res.status(200).json({
      status: "OK",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "ERR",
    });
  }
};

const getChatById = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const response = await ChatService.getChatById(chatId);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: error.message,
      });
    }

    return res.status(200).json({
      status: "OK",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "ERR",
    });
  }
};

const sendMessageToUser = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        status: "ERR",
        message: "Message is required and must be a non-empty string.",
      });
    }

    const response = await ChatService.sendMessageToUser(
      chatId,
      req.user.id,
      message
    );
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: "Have problem when sending message. Please try again later.",
      });
    }

    return res.status(200).json({
      status: "OK",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: "ERR",
    });
  }
};

module.exports = {
  createChat,
  getChat,
  getAllChats,
  getChatById,
  sendMessageToUser,
};
