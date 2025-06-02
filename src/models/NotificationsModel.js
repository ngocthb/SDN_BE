const mongoose = require("mongoose");

const notificationsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    }, // Ma nguoi dung nhan thong bao
    title: {
      type: String,
      required: true,
    }, // Tieu de thong bao
    message: {
      type: String,
      required: true,
    }, // Noi dung thong bao
    type: {
      type: String,
      enum: ["daily", "weekly", "motivation", "reminder"], // Loai thong bao
      default: "daily", // Mac dinh la thong bao thong tin
    },
    isRead: {
      type: Boolean,
      default: false, // Mac dinh la chua doc
    },
  },
  {
    timestamps: true, // Tu dong them truong createdAt va updatedAt
  }
);
const NotificationsModel = mongoose.model("notifications", notificationsSchema);
module.exports = NotificationsModel;
