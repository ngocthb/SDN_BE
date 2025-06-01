const express = require("express");
const routerOrder = express.Router();
const orderController = require("../controller/OrderController.js");
const { authUserMiddleware } = require("../middleware/authMiddleware");

routerOrder.get("/", authUserMiddleware, orderController.getAllOrdersByUser);
routerOrder.post("/", authUserMiddleware, orderController.createOrder);

module.exports = routerOrder;
