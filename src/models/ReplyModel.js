const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      required: true,
    },
    reply: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("replies", replySchema);
