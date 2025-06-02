const mongoose = require("mongoose");

const quitPlansSchema = new mongoose.Schema(
  {
    _id: false, // Bo id mac dinh o bang nay
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    }, //ly do muon bo thuoc
    startDate: {
      type: Date,
      required: true,
    }, // Ngay bat dau bo thuoc
    expectedQuitDate: {
      type: Date,
      required: true,
    }, // Ngay mong muon bo thuoc thanh cong
    isActive: {
      type: Boolean,
      default: true,
    }, // Mac dinh la dang thuc hien ke hoach bo thuoc true: dang thuc hien, false: da hoan thanh ke hoach
  },

  {
    timestamps: true,
  }
);

const QuitPlansModel = mongoose.model("quitPlans", quitPlansSchema);
module.exports = QuitPlansModel;
