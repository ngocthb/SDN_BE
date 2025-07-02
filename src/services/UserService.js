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
    if (user.length === 0) {
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

module.exports = {
  createUser,
  loginUser,
  resetPassword,
};
