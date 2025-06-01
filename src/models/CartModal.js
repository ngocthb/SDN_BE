const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
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
        quality: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

const CartModel = mongoose.model("cart", cartSchema);
module.exports = CartModel;
