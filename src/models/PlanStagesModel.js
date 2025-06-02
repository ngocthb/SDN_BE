const mongoose = require("mongoose");

// bảng này lưu các giai đoạn của kế hoạch bỏ thuốc lá
const planStagesSchema = new mongoose.Schema(
  {
    quitPlansId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quitPlans",
      required: true,
    }, // Ma ke hoach có sẵn trong hệ thống
    title: {
      type: String,
      required: true,
    }, // Tên giai đoạn
    description: {
      type: String,
      required: true,
    }, // Mô tả giai đoạn
    orderNumber: {
      type: Number,
      required: true,
    }, // Thứ tự giai đoạn trong kế hoạch
    daysToComplete: {
      type: Number,
      required: true,
    }, // Số ngày để hoàn thành giai đoạn này
  },
  {
    timestamps: true,
  }
);

const PlanStagesModel = mongoose.model("planStages", planStagesSchema);
module.exports = PlanStagesModel;
