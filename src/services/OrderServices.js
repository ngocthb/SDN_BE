const OrderModel = require("../models/OrderModal");
const CartModel = require("../models/CartModal");
const getAllOrdersByUser = async (userId) => {
  try {
    const orders = await OrderModel.find({ user_id: userId }).populate(
      "dishes.dish",
      "name price image"
    );
    return orders;
  } catch (error) {
    throw new Error(`Error fetching orders: ${error.message}`);
  }
};

const createOrder = async ({ user_id, carts, address }) => {
  try {
    const order = new OrderModel({
      user_id,
      carts, // Phải là mảng [{ dish: ObjectId, quality: Number }]
      address,
    });

    const savedOrder = await order.save();

    await CartModel.updateOne(
      { user_id },
      {
        $pull: {
          carts: {
            dish_id: { $in: carts.map((item) => item.dish_id) },
          },
        },
      }
    );
    return savedOrder;
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

module.exports = {
  getAllOrdersByUser,
  createOrder,
};
