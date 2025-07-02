const express = require("express");
const routerUser = express.Router();
const userController = require("../controller/UserController");
const {
    authUserMiddleware,
} = require("../middleware/authMiddleware");

routerUser.post("/register", userController.createUser);

routerUser.post("/login", userController.loginUser);

routerUser.post("/forgot-pass", userController.resetPassword);

routerUser.use(authUserMiddleware); // Apply auth middleware to all routes below

routerUser.put("/change-password", userController.changePassword);

routerUser.put("/update-profile", userController.updateProfile);

routerUser.get("/profile", userController.getUserProfile);

module.exports = routerUser;
