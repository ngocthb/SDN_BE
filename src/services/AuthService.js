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

const sendOTP = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Email does not exist!");

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.verifyOTP = otp;
  user.verifyOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "🎉 Xác thực tài khoản - Mã OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #28a745; margin: 0;">🎉 Chào mừng đến với ứng dụng cai thuốc!</h2>
          <p style="color: #6c757d; font-size: 14px;">Bước cuối cùng để hoàn tất đăng ký tài khoản</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin-top: 0;">👋 Xin chào!</h3>
          <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;">
            Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký và bắt đầu hành trình cai thuốc, 
            vui lòng xác thực địa chỉ email bằng mã OTP bên dưới:
          </p>
        </div>

        <div style="background-color: #e7f3ff; border: 2px solid #007bff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">🔑 Mã xác thực của bạn</h3>
          <div style="background-color: white; padding: 15px 20px; border-radius: 5px; font-size: 28px; font-weight: bold; color: #007bff; letter-spacing: 3px; margin: 10px 0;">
            ${otp}
          </div>
          <p style="color: #0056b3; font-size: 14px; margin: 5px 0;">Vui lòng nhập mã này vào ứng dụng để xác thực tài khoản</p>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">⚠️ Lưu ý quan trọng</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Mã OTP này có hiệu lực trong <strong>10 phút</strong></li>
            <li>Vui lòng không chia sẻ mã này với bất kỳ ai</li>
            <li>Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này</li>
          </ul>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #28a745; margin-top: 0;">🌟 Những gì đang chờ bạn</h4>
          
          <div style="margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
            <h5 style="color: #007bff; margin: 0 0 5px 0; font-size: 16px;">📋 Kế hoạch cá nhân</h5>
            <p style="font-size: 14px; margin: 0; color: #6c757d; line-height: 1.4;">Tạo kế hoạch cai thuốc phù hợp với bạn và tình trạng hiện tại</p>
          </div>

          <div style="margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #28a745;">
            <h5 style="color: #28a745; margin: 0 0 5px 0; font-size: 16px;">📊 Theo dõi tiến trình</h5>
            <p style="font-size: 14px; margin: 0; color: #6c757d; line-height: 1.4;">Ghi nhận và theo dõi quá trình cai thuốc hàng ngày</p>
          </div>

          <div style="margin-bottom: 15px; padding: 12px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h5 style="color: #ffc107; margin: 0 0 5px 0; font-size: 16px;">🏆 Thành tích & Huy hiệu</h5>
            <p style="font-size: 14px; margin: 0; color: #6c757d; line-height: 1.4;">Nhận huy hiệu và thành tích khi đạt được mục tiêu</p>
          </div>

          <div style="margin-bottom: 0; padding: 12px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #dc3545;">
            <h5 style="color: #dc3545; margin: 0 0 5px 0; font-size: 16px;">💬 Cộng đồng hỗ trợ</h5>
            <p style="font-size: 14px; margin: 0; color: #6c757d; line-height: 1.4;">Kết nối với những người có cùng mục tiêu và chia sẻ kinh nghiệm</p>
          </div>
        </div>

        <div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #155724; font-size: 16px; margin: 0; text-align: center; font-weight: 500;">
            💪 <strong>Bước đầu tiên của hành trình thay đổi cuộc sống!</strong> 💪
          </p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #6c757d; margin: 0;">
            Gặp khó khăn trong quá trình xác thực? 
            <a href="mailto:support@example.com" style="color: #007bff; text-decoration: none;">Liên hệ hỗ trợ</a>
          </p>
        </div>

        <hr style="border: 0.5px solid #ddd; margin: 20px 0;">
        
        <div style="text-align: center;">
          <p style="font-size: 12px; color: #6c757d; margin: 0;">
            Bạn nhận được email này vì đã đăng ký tài khoản tại ứng dụng cai thuốc của chúng tôi.
          </p>
          <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">
            &copy; 2025 Ứng dụng cai thuốc. Cùng nhau vì một cuộc sống khỏe mạnh!
          </p>
        </div>
      </div>
    `,
  });

  return { status: "OK", message: `OTP send to ${email} successfully.` };
};

const CheckOTP = async (email, otp) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Email does not exist!");

  if (user.verifyOTP !== otp) {
    throw new Error("Invalid OTP");
  }

  if (Date.now() > user.verifyOTPExpires) {
    throw new Error("OTP has expired");
  }

  user.status = true;
  user.verifyOTP = null;
  user.verifyOTPExpires = null;
  await user.save();
  return { status: "OK", message: "OTP verified successfully." };
};

const forgotPass = async (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(
      "Your email is invalid. Please enter a valid email address."
    );
  }
  const user = await UserModel.findOne({ email });
  if (!user)
    throw new Error("User not found with this email. Please register first.");

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.verifyOTP = otp;
  user.verifyOTPExpires = Date.now() + 10 * 60 * 1000;
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

  return { status: "OK", message: `OTP sent to ${email} successfully.` };
};

module.exports = {
  sendOTP,
  CheckOTP,
  forgotPass,
};
