const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurants",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("types", typeSchema);
