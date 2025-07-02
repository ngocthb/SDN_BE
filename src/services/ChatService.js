const Chat = require("../model/ChatModel");
const User = require("../model/UserModel");

const createChat = async (currentUserId, receiverId) => {
  try {
    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: currentUserId } } },
        { users: { $elemMatch: { $eq: receiverId } } },
      ],
    })
      .populate("users", "-passwordHash")
      .populate("latestMessage");

    if (isChat.length > 0) {
      isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name picture email",
      });
      return isChat[0];
    } else {
      const chatData = {
        users: [currentUserId, receiverId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-passwordHash"
      );

      return fullChat;
    }
  } catch (error) {
    throw new Error(`Error creating chat: ${error.message}`);
  }
};

module.exports = {
  createChat,
};
