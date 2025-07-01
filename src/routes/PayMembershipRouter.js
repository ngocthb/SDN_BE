const express = require("express");
const routerOrder = express.Router();
const payMemberController = require("../controller/PayMembershipController");

routerOrder.post("/", payMemberController.createOrder);

routerOrder.post("/confirm-payment", payMemberController.confirmPayment);

module.exports = routerOrder;
