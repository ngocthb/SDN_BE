const DishesModel = require("../models/DishesModal");
const OrderServices = require("../services/OrderServices");

const getAllOrdersByUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await OrderServices.getAllOrdersByUser(userId);
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ status: "ERR", message: "No orders found" });
    }
    return res.status(200).json({ status: "OK", data: orders });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { carts, address } = req.body;

  if (!carts || !Array.isArray(carts) || carts.length === 0) {
    return res.status(400).json({
      status: "ERR",
      message: "Carts are required and must be a non-empty array",
    });
  }

  if (!address || typeof address !== "string") {
    return res.status(400).json({
      status: "ERR",
      message: "Delivery address is required and must be a string",
    });
  }

  try {
    const order = await OrderServices.createOrder({
      user_id: userId,
      carts: carts,
      address: address,
    });

    return res.status(201).json({ status: "OK", data: order });
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

module.exports = {
  getAllOrdersByUser,
  createOrder,
};
