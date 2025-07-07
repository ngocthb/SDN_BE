const AuthService = require("../services/AuthService");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await AuthService.sendOTP(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const CheckOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const response = await AuthService.CheckOTP(email, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await AuthService.forgotPass(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const CheckResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ message: "OTP is required" });
    }
    const response = await AuthService.CheckResetOTP(email, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const response = await AuthService.resetPassword(email, newPassword);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  sendOTP,
  forgotPassword,
  CheckOTP,
  CheckResetOTP,
  resetPassword,
};