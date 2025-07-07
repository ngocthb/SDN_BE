const mongoose = require("mongoose");

// Bang nay luu cac tien trinh thuc hien ke hoach bo thuoc cua nguoi dung

const progressLogsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    quitPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quitPlans",
      required: false, // Hoặc true nếu bắt buộc xác định kế hoạch
    },
    cigarettesPerDay: {
      type: Number,
      required: true,
      min: 0,
    }, // So luong thuoc hut moi ngay
    healthNote: {
      type: String,
      required: false,
    }, // Ghi chu ve suc khoe
    mood: {
      type: String,
      required: false,
      // Trang thai cam xuc
    },
    date: {
      type: Date,
      required: true,
    }, // Ngay ghi nhan tien trinh
  },
  {
    timestamps: true,
  }
);

const ProgressLogsModel = mongoose.model("progressLogs", progressLogsSchema);
module.exports = ProgressLogsModel;
