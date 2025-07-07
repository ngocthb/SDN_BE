const UserServices = require("../services/UserService");
const AuthService = require("../services/AuthService");
const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
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
    const createUser = await UserServices.createUser(name, email, password, confirmPassword);
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
      return res.status(201).json({ status: "ERR", message: error.message });
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

// THÊM MỚI: Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy từ middleware xác thực

    // Validation
    if (!oldPassword || !oldPassword.trim() || !newPassword || !newPassword.trim()) {
      return res.status(400).json({
        status: "ERR",
        message: "Old password and new password are required"
      });
    }

    const result = await UserServices.changePassword(userId, oldPassword, newPassword);

    return res.status(200).json({
      status: "OK",
      message: result.message,
      data: result.user
    });

  } catch (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.message
    });
  }
};

// THÊM MỚI: Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware xác thực
    const updateData = req.body;

    // Validation cơ bản
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Update data is required"
      });
    }

    // Kiểm tra nếu cố gắng đổi email
    if (updateData.email) {
      return res.status(400).json({
        status: "ERR",
        message: "Email cannot be changed"
      });
    }

    const result = await UserServices.updateProfile(userId, updateData);

    return res.status(200).json({
      status: "OK",
      message: result.message,
      data: result.user
    });

  } catch (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.message
    });
  }
};

// THÊM MỚI: Lấy thông tin profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware xác thực

    const result = await UserServices.getUserProfile(userId);

    return res.status(200).json({
      status: "OK",
      data: result.user
    });

  } catch (error) {
    return res.status(400).json({
      status: "ERR",
      message: error.message
    });
  }
};
module.exports = {
  createUser,
  loginUser,
  resetPassword,
  changePassword,
  updateProfile,
  getUserProfile
};
