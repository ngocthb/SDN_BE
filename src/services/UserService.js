const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwtService = require("./JwtService");

const createUser = async (name, email, password) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(
        "Your email is invalid. Please enter a valid email address."
      );
    }
    const emailExists = await UserModel.findOne({ email: email });
    if (emailExists) {
      if (emailExists.status === false) {
        const hashedPassword = await bcrypt.hash(password, 10);
        emailExists.name = name;
        emailExists.passwordHash = hashedPassword;
        await emailExists.save();
        return emailExists;
      } else {
        throw new Error(
          "This email is already registered. Please use a different email."
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name: name,
      email: email,
      passwordHash: hashedPassword,
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      throw new Error("User not found with this email. Please register first.");
    }

    if (user.status === false) {
      throw new Error("User is not active. Please verify your account.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Your password is incorrect. Please try again.");
    }

    // mã hóa thông tin người dùng và tạo token
    const token = jwtService.generalAccessToken({
      id: user._id,
      username: user.name,
      isAdmin: user.isAdmin,
      isCoach: user.isCoach,
    });
    return { user: user, token: token };
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (email, newPassword) => {
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      throw new Error("User not found with this email. Please register first.");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// THÊM MỚI: Đổi mật khẩu
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Validation
    if (!oldPassword || !oldPassword.trim()) {
      throw new Error("Old password is required");
    }
    if (!newPassword || !newPassword.trim()) {
      throw new Error("New password is required");
    }
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }
    if (oldPassword === newPassword) {
      throw new Error("New password cannot be the same as the old password");
    }

    // Tìm user theo ID
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.passwordHash = hashedNewPassword;
    await user.save();

    // Trả về user (không bao gồm password)
    const { passwordHash, verifyOTP, verifyOTPExpires, ...userWithoutPassword } = user.toObject();

    return {
      success: true,
      message: "Password changed successfully",
      user: userWithoutPassword
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

// THÊM MỚI: Edit profile (không cho đổi email)
const updateProfile = async (userId, updateData) => {
  try {
    // Validation
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Tìm user theo ID
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Loại bỏ các field không được phép cập nhật
    const {
      email,           // Không cho đổi email
      passwordHash,    // Không cho đổi password qua hàm này
      verifyOTP,       // Không cho đổi OTP
      verifyOTPExpires,
      isAdmin,         // Không cho đổi quyền admin
      isCoach,         // Không cho đổi quyền coach
      status,          // Không cho đổi status
      _id,
      __v,
      createdAt,
      updatedAt,
      ...allowedUpdates
    } = updateData;

    // Validation cho các field được phép cập nhật
    if (allowedUpdates.name && (!allowedUpdates.name.trim() || allowedUpdates.name.length < 2)) {
      throw new Error("Name must be at least 2 characters long");
    }

    if (allowedUpdates.dateOfBirth) {
      const birthDate = new Date(allowedUpdates.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      if (age > 120) {
        throw new Error("Invalid date of birth");
      }
    }

    if (allowedUpdates.gender !== undefined && typeof allowedUpdates.gender !== 'boolean') {
      throw new Error("Gender must be true (female) or false (male)");
    }

    if (allowedUpdates.picture && allowedUpdates.picture.trim() === '') {
      // Nếu picture rỗng, đặt về default
      allowedUpdates.picture = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
    }

    // Cập nhật user với dữ liệu được phép
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      {
        new: true,           // Trả về document sau khi update
        runValidators: true  // Chạy validation
      }
    );

    // Trả về user (không bao gồm sensitive data)
    const { passwordHash: updatedUserPasswordHash, verifyOTP: updatedUserOTP, verifyOTPExpires: updatedUserOTPExpires, ...userWithoutSensitiveData } = updatedUser.toObject(); // SỬA: destructuring với alias

    return {
      success: true,
      message: "Profile updated successfully",
      user: userWithoutSensitiveData
    };

  } catch (error) {
    throw new Error(error.message);
  }
};

// THÊM MỚI: Lấy thông tin profile user
const getUserProfile = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Trả về user (không bao gồm sensitive data)
    const { passwordHash, verifyOTP, verifyOTPExpires, ...userProfile } = user.toObject();

    return {
      success: true,
      user: userProfile
    };

  } catch (error) {
    throw new Error(error.message);
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
