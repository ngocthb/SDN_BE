const express = require("express");

const routerRestaurant = express.Router();
const restaurantController = require("../controller/RestaurantController");

routerRestaurant.get("/", restaurantController.getAllRestaurant);
routerRestaurant.get("/:id", restaurantController.getRestaurantById);

module.exports = routerRestaurant;
