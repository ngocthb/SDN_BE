const CartModal = require("../models/CartModal");
const mongoose = require("mongoose");
const RestaurantModel = require("../models/RestaurantsModal");

const getAllCart = async (userId) => {
  try {
    const cartData = await CartModal.findOne({ user_id: userId }).populate(
      "carts.dish_id"
    );
    if (!cartData || cartData.carts.length === 0) {
      return { status: "ERR", message: "No cart items found" };
    }

    const allRestaurants = await RestaurantModel.find().populate("dishes_id");

    const dishToRestaurantMap = new Map();
    allRestaurants.forEach((restaurant) => {
      restaurant.dishes_id.forEach((dish) => {
        dishToRestaurantMap.set(dish._id.toString(), {
          restaurant_id: restaurant._id,
          restaurant_name: restaurant.name,
          restaurant_image: restaurant.image,
        });
      });
    });

    const grouped = {};

    cartData.carts.forEach((item) => {
      const dish = item.dish_id;
      const dishId = dish._id.toString();
      const restInfo = dishToRestaurantMap.get(dishId);

      if (!restInfo) return;
      const restId = restInfo.restaurant_id.toString();

      if (!grouped[restId]) {
        grouped[restId] = {
          restaurant_id: restId,
          restaurant_name: restInfo.restaurant_name,
          restaurant_image: restInfo.restaurant_image,
          dishes: [],
        };
      }

      grouped[restId].dishes.push({
        dish_id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: item.quality,
      });
    });

    return Object.values(grouped);
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const updateCart = async (user_id, carts) => {
  if (!carts || !Array.isArray(carts) || carts.length === 0) {
    throw new Error("Carts are required and must be a non-empty array");
  }

  try {
    await CartModal.findOneAndUpdate(
      { user_id },
      { carts },
      { new: true, upsert: true }
    );

    const updatedCart = await CartModal.findOne({ user_id }).populate(
      "carts.dish_id"
    );

    const allRestaurants = await RestaurantModel.find().populate("dishes_id");

    const dishToRestaurantMap = new Map();
    allRestaurants.forEach((restaurant) => {
      restaurant.dishes_id.forEach((dish) => {
        dishToRestaurantMap.set(dish._id.toString(), {
          restaurant_id: restaurant._id,
          restaurant_name: restaurant.name,
          restaurant_image: restaurant.image,
        });
      });
    });

    const grouped = {};

    updatedCart.carts.forEach((item) => {
      const dish = item.dish_id;
      const dishId = dish._id.toString();
      const restInfo = dishToRestaurantMap.get(dishId);
      if (!restInfo) return;

      const restId = restInfo.restaurant_id.toString();

      if (!grouped[restId]) {
        grouped[restId] = {
          restaurant_id: restId,
          restaurant_name: restInfo.restaurant_name,
          restaurant_image: restInfo.restaurant_image,
          dishes: [],
        };
      }

      grouped[restId].dishes.push({
        dish_id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: item.quality,
      });
    });

    return Object.values(grouped);
  } catch (error) {
    console.error("Error in updateCart:", error);
    return {
      status: "ERR",
      message: error.message,
    };
  }
};

module.exports = {
  getAllCart,

  updateCart,
};
