const RestaurantsModel = require("../models/RestaurantsModal");
const DishesModel = require("../models/DishesModal");
const getAllRestaurant = async () => {
  try {
    const restaurants = await RestaurantsModel.find();
    if (!restaurants) {
      return { status: "ERR", message: "No restaurants found" };
    }
    return restaurants;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const getRestaurantById = async (restaurantId) => {
  try {
    const restaurant = await RestaurantsModel.findById(restaurantId);

    if (!restaurant) {
      return { status: "ERR", message: "No dishes found for this restaurant" };
    }
    const dishes = await DishesModel.find({
      _id: { $in: restaurant.dishes_id },
    });
    let outputData = {
      ...restaurant._doc,
      dishes: dishes,
    };

    delete outputData.dishes_id;

    return outputData;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

module.exports = {
  getAllRestaurant,
  getRestaurantById,
};
