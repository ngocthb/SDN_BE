const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: { uri: String }, required: true },
  },
  {
    timestamps: true,
  }
);

const CategoriesModel = mongoose.model("categories", categoriesSchema);
module.exports = CategoriesModel;
