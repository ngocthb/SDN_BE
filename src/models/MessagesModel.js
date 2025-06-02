const mongoose = require("mongoose");

// chi co user nhan tin vs coach va nguoc lai
const messagesSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    }, // Nội dung tin nhắn
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người gửi tin nhắn
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Người nhận tin nhắn
  },
  {
    timestamps: true,
  }
);

const MessagesModel = mongoose.model("messages", messagesSchema);
module.exports = MessagesModel;
