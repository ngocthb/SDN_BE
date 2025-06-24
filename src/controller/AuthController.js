const AuthService = require("../services/AuthService");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await AuthService.sendOTP(email);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const CheckOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !email.trim() || !otp || !otp.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await AuthService.CheckOTP(email, otp);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await AuthService.forgotPass(email);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  CheckOTP,
  sendOTP,
  forgotPass,
};
