const CategoryModel = require("../models/CategoriesModal");
const DishesModel = require("../models/DishesModal");
const mongoose = require("mongoose");
const getAllCategory = async () => {
  try {
    const categories = await CategoryModel.find();
    if (!categories) {
      return { status: "ERR", message: "No categories found" };
    }
    return categories;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return { status: "ERR", message: "No category found with this ID" };
    }
    const objectId = new mongoose.Types.ObjectId(categoryId);
    const dishes = await DishesModel.find({
      category_id: objectId,
    });

    let outputData = {
      ...category._doc,
      dishes: dishes,
    };

    console.log("categoryId:", categoryId);
    console.log("objectId:", objectId);
    console.log("Dishes found:", dishes);

    return outputData;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

module.exports = {
  getAllCategory,
  getCategoryById,
};
