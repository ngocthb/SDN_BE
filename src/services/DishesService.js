const DishesModel = require("../models/DishesModal");
const RestaurantModel = require("../models/RestaurantsModal");

const getAllDishes = async () => {
  try {
    const dishes = await DishesModel.find();
    if (!dishes) {
      return { status: "ERR", message: "No dishes found" };
    }
    return dishes;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

module.exports = {
  getAllDishes,
};
