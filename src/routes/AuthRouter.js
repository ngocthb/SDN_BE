const express = require("express");
const AuthController = require("../controller/AuthController");
const AuthRouter = express.Router();

AuthRouter.post("/check", AuthController.CheckOTP);

AuthRouter.post("/forgot-pass", AuthController.forgotPass);

module.exports = AuthRouter;
