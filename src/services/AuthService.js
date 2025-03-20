const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");
const { GoogleAuth } = require("google-auth-library");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordOTP = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Email does not exist!");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "🔒 Reset Password OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">🔐 Reset Your Password</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="text-align: center; padding: 10px 20px; background-color: #f3f3f3; border-radius: 5px; font-size: 20px; font-weight: bold;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: red;">⚠️ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
        <hr style="border: 0.5px solid #ddd;">
        <p style="text-align: center; font-size: 12px; color: #666;">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    `,
  });

  return { status: "OK", message: "OTP send to email successfully." };
};

const resetPassword = async (email, otp, newPassword) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Account does not exist!");

  if (user.resetPasswordOTP !== otp) {
    throw new Error("OTP is invalid ");
  }

  if (user.resetPasswordExpires < Date.now()) {
    throw new Error("OTP is expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { status: "OK", message: "Reset password successfully!" };
};

let cachedToken = null;
let tokenExpiration = 0;

const keyFile = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const getToken = async () => {
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  const auth = new GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  cachedToken = token.token;
  tokenExpiration = Date.now() + 50 * 60 * 1000;

  return cachedToken;
};

module.exports = {
  sendResetPasswordOTP,
  resetPassword,
  getToken,
};
