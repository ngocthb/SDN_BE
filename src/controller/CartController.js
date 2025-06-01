const CartServices = require("../services/CartServices");

const getAllCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const response = await CartServices.getAllCart(userId);
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "No cart items found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const updateCart = async (req, res) => {
  const userId = req.user.id;
  const { carts } = req.body;

  if (!carts || !Array.isArray(carts) || carts.length === 0) {
    return res.status(400).json({
      status: "ERR",
      message: "Carts are required and must be a non-empty array",
    });
  }

  try {
    const response = await CartServices.updateCart(userId, carts);
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  getAllCart,
  updateCart,
};
