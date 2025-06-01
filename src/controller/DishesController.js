const DishesService = require("../services/DishesService");

const getAllDishes = async (req, res) => {
  try {
    const response = await DishesService.getAllDishes();
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "No dishes found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllDishes,
};
