const mongoose = require("mongoose");

const dishesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: { uri: String }, required: true },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const DishesModel = mongoose.model("dishes", dishesSchema);
module.exports = DishesModel;
