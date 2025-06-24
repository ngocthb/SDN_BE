const ChatService = require("../services/ChatService.js");

const createChat = async (req, res) => {
  try {
    //User nguoi dung nhap vao
    const { userId } = req.body;

    const response = await ChatService.createChat(req.user._id, userId);
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
    console.error("Error creating chat:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: "ERR",
    });
  }
};

module.exports = {
  createChat,
};
