const express = require("express");

const routerDishes = express.Router();
const dishesController = require("../controller/DishesController");

routerDishes.get("/", dishesController.getAllDishes);

module.exports = routerDishes;
