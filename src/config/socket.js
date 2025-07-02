const Chat = require("../models/ChatModel");
const Message = require("../models/MessagesModel");
const User = require("../models/UserModel");

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    console.log("Socket ID:", socket.id);

    // 1️⃣ Client yêu cầu join room
    socket.on("join_room", async (userId) => {
      try {
        let chat = await Chat.findOne({ userId });
        if (!chat) {
          chat = await Chat.create({ userId });
        }
        socket.join(chat._id.toString());
        console.log(` joined room: ${chat._id}`);
      } catch (err) {
        console.error("Join room error:", err);
      }
    });

    // 2️⃣ Gửi tin nhắn user
    socket.on("send_message", async ({ userId, message }) => {
      try {
        let chat = await Chat.findOne({ userId });
        if (!chat) {
          chat = await Chat.create({ userId });
        }

        const newMessage = new Message({
          message,
          senderId: userId,
          chatId: chat._id,
        });
        const savedMessage = await newMessage.save();

        // Cập nhật latestMessage
        chat.latestMessage = savedMessage._id;
        await chat.save();

        // Gửi lại cho tất cả trong room
        const populatedMessage = await Message.findById(savedMessage._id)
          .select("-updatedAt -chatId -__v")
          .populate("senderId", "name picture email");

        io.to(chat._id.toString()).emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    socket.on("join_room_coach", async (userId) => {
      try {
        let role = await User.findById(userId);
        if (role.isCoach === true || role.isAdmin === true) {
          return;
        }
        let chat = await Chat.findOne({ userId });
        if (!chat) {
          chat = await Chat.create({ userId });
        }
        socket.join(chat._id.toString());
      } catch (err) {
        console.error("Join room error:", err);
      }
    });

    socket.on("send_message_by_coach", async ({ receiveId, message }) => {
      try {
        let chat = await Chat.findOne({ userId: receiveId });
        if (!chat) {
          chat = await Chat.create({ userId: receiveId });
        }
        const senderId = await User.findOne({ isCoach: true });
        const newMessage = new Message({
          message,
          senderId: senderId._id,
          chatId: chat._id,
        });

        const savedMessage = await newMessage.save();

        // Cập nhật latestMessage
        chat.latestMessage = savedMessage._id;
        await chat.save();

        // Gửi lại cho tất cả trong room
        const populatedMessage = await Message.findById(savedMessage._id)
          .select("-updatedAt -chatId -__v")
          .populate("senderId", "name picture email");

        io.to(chat._id.toString()).emit("receive_message", populatedMessage);
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    socket.on("typing", ({ chatId, userName }) => {
      console.log(`User ${userName} is typing in chat ${chatId}`);
      socket.to(chatId).emit("typing", { userName, chatId });
    });

    socket.on("stop_typing", ({ chatId }) => {
      socket.to(chatId).emit("stop_typing");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;
