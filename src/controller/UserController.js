const UserServices = require("../services/UserService");
const AuthService = require("../services/AuthService");
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      !name ||
      !name.trim() ||
      !email ||
      !email.trim() ||
      !password ||
      !password.trim()
    ) {
      return res
        .status(400)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const createUser = await UserServices.createUser(name, email, password);
    if (!createUser) {
      return res.status(400).json({ status: "ERR", message: message });
    }
    const response = await AuthService.sendOTP(email);
    if (!response) {
      return res.status(400).json({ status: "ERR", message: message });
    }

    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim() || !password || !password.trim()) {
      return res
        .status(400)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const response = await UserServices.loginUser(email, password);
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "Invalid phone or password" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (
      !email ||
      !email.trim() ||
      !otp ||
      !otp.trim() ||
      !newPassword ||
      !newPassword.trim()
    ) {
      return res
        .status(400)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const response = await AuthService.CheckOTP(email, otp);
    if (!response) {
      return res.status(400).json({ status: "ERR", message: "Invalid OTP" });
    }
    const user = await UserServices.resetPassword(email, newPassword);
    if (!user) {
      return res.status(400).json({ status: "ERR", message: message });
    }
    return res.status(200).json({ status: "OK", data: user });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
module.exports = {
  createUser,
  loginUser,
  resetPassword,
};
