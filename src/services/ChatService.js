const Chat = require("../models/ChatModel");
const User = require("../models/UserModel");
const Message = require("../models/MessagesModel");

const createChat = async (userId, messageText) => {
  // userId là thằng đăng nhập
  try {
    let chat = await Chat.findOne({ userId: userId })
      .populate("userId", "name picture email")
      .populate("latestMessage");
    if (!chat) {
      chat = new Chat({ userId: userId });
      await chat.save();
    }

    const newMessage = new Message({
      message: messageText,
      senderId: userId,
      chatId: chat._id,
    });

    const savedMessage = await newMessage.save();

    chat.latestMessage = savedMessage._id;
    await chat.save();

    //userId la ng gui tin nhan vs coach la thang dang nhap luon

    const fullChat = await Chat.findOne({ _id: chat._id }).populate(
      "userId",
      "name picture email"
    );

    return fullChat;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getChat = async (userId) => {
  try {
    const chat = await Chat.findOne({ userId: userId });

    const messages = await Message.find({ chatId: chat._id })
      .select(" -updatedAt -__v")
      .populate("senderId", "name picture email")
      .sort({ createdAt: 1 });

    if (!chat) {
      return {
        status: "ERR",
        message: "No chat found for this user.",
      };
    }

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllChats = async () => {
  try {
    const chats = await Chat.find({})
      .sort({ updatedAt: -1 })
      .select("-__v -createdAt")
      .populate("userId", "name picture email")
      .populate("latestMessage");

    if (!chats || chats.length === 0) {
      return {
        status: "ERR",
        message: "No chats found.",
      };
    }

    return chats;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return {
        status: "ERR",
        message: "Don't have chat with this user yet.",
      };
    }
    const messages = await Message.find({ chatId: chat._id })
      .select("-updatedAt -chatId -__v")
      .populate("senderId", "name picture email")
      .sort({ createdAt: 1 });

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendMessageToUser = async (chatId, userId, messageText) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return {
        status: "ERR",
        message: "You can't send message for user first.",
      };
    }
    const newMessage = new Message({
      message: messageText,
      senderId: userId,
      chatId: chat._id,
    });
    const savedMessage = await newMessage.save();
    chat.latestMessage = savedMessage._id;
    await chat.save();
    const fullChat = await Chat.findOne({ _id: chat._id }).populate(
      "userId",
      "name picture email"
    );
    return fullChat;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createChat,
  getChat,
  getAllChats,
  getChatById,
  sendMessageToUser,
};
