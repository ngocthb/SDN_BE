const express = require("express");
const routerUser = express.Router();
const userController = require("../controller/UserController");

routerUser.post("/register", userController.createUser);

routerUser.post("/login", userController.loginUser);

routerUser.post("/forgot-pass", userController.resetPassword);

module.exports = routerUser;
