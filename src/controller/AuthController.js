const AuthService = require("../services/AuthService");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await AuthService.sendResetPasswordOTP(email);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const isStrictPassword = (password) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };
    if (!isStrictPassword(newPassword)) {
      return res.status(200).json({
        status: "ERR",
        message:
          "Password must contain at least 8 characters, including uppercase and number",
      });
    }
    const response = await AuthService.resetPassword(email, otp, newPassword);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getToken = async (req, res) => {
  try {
    const token = await AuthService.getToken();
    res.json({ accessToken: token });
  } catch (error) {
    res.status(500).json({ error: "Error token" });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,

  getToken,
};
