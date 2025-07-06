const UserModel = require('../models/UserModel');
const nodemailer = require('nodemailer');
const { GoogleAuth } = require('google-auth-library');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendOTP = async (email) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Email does not exist!');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.verifyOTP = otp;
    user.verifyOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
        from: `"Your Company" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔒 Verify Your Account - OTP Code',
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #007bff; text-align: center;">🔐 Verify Your Account</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Thank you for registering with us! Use the OTP below to verify your account:</p>
      <div style="text-align: center; padding: 10px 20px; background-color: #f3f3f3; border-radius: 5px; font-size: 20px; font-weight: bold;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: red;">⚠️ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
      <hr style="border: 0.5px solid #ddd;">
      <p style="text-align: center; font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  `
    });

    return { status: 'OK', message: `OTP send to ${email} successfully.` };
};

const CheckOTP = async (email, otp) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Email does not exist!');

    if (user.verifyOTP !== otp) {
        throw new Error('Invalid OTP');
    }

    if (Date.now() > user.verifyOTPExpires) {
        throw new Error('OTP has expired');
    }

    user.status = true;
    user.verifyOTP = null;
    user.verifyOTPExpires = null;
    await user.save();
    return { status: 'OK', message: 'OTP verified successfully.' };
};

const forgotPass = async (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error(
            'Your email is invalid. Please enter a valid email address.'
        );
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error(
            'User not found with this email. Please register first.'
        );
    }

    if (user.status === false) {
        throw new Error(
            'Your account is not verified. Please verify your account first.'
        );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.verifyOTP = otp;
    user.verifyOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: '🔒 Reset Password OTP',
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
        <p style="text-align: center; font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    `
    });

    return { status: 'OK', message: `OTP sent to ${email} successfully.` };
};

const CheckResetOTP = async (email, otp) => {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isValidOTP =
            user.verifyOTP === otp && user.verifyOTPExpires > Date.now();
        if (!isValidOTP) {
            throw new Error('Invalid or expired OTP');
        }
        user.verifyOTP = null;
        user.verifyOTPExpires = null;
        await user.save();

        return { message: 'OTP verified successfully' };
    } catch (error) {
        throw new Error(error.message);
    }
};

const resetPassword = async (email, newPassword) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { status: 'OK', message: 'Password reset successfully!' };
};

module.exports = {
    sendOTP,
    CheckOTP,
    forgotPass,
    CheckResetOTP,
    resetPassword
};
