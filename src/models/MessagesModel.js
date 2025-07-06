const mongoose = require("mongoose");

// chi co user nhan tin vs coach va nguoc lai
const messagesSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessagesModel = mongoose.model("messages", messagesSchema);
module.exports = MessagesModel;
