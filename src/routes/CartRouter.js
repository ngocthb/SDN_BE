const express = require("express");

const routerCart = express.Router();
const cartController = require("../controller/CartController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

routerCart.get("/", authUserMiddleware, cartController.getAllCart);

routerCart.put("/", authUserMiddleware, cartController.updateCart);

module.exports = routerCart;
