const RestaurantsService = require("../services/RestaurantsService");
const getAllRestaurant = async (req, res) => {
  try {
    const response = await RestaurantsService.getAllRestaurant();
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "No restaurants found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await RestaurantsService.getRestaurantById(id);
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: "No restaurant found with this ID",
      });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllRestaurant,
  getRestaurantById,
};
