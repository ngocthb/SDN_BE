const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    carts: [
      {
        _id: false,
        dish_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "dishes",
          required: true,
        },
        quality: { type: Number, required: true },
      },
    ],
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("orders", orderSchema);
module.exports = OrderModel;
