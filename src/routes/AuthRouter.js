const express = require("express");
const AuthController = require("../controller/AuthController");
const AuthRouter = express.Router();

AuthRouter.post("/send-otp", AuthController.sendOTP);
AuthRouter.post("/check", AuthController.CheckOTP);
AuthRouter.post("/forgot-password", AuthController.forgotPassword);
AuthRouter.post("/check-reset-otp", AuthController.CheckResetOTP);
AuthRouter.post("/reset-password", AuthController.resetPassword);

module.exports = AuthRouter;