const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwtService = require("./JwtService");

const createUser = async (name, phone, email, password) => {
  try {
    const user = await UserModel.find({ phone: phone });
    if (user.length > 0) {
      throw new Error("User with this phone number already exists");
    }
    const emailExists = await UserModel.find({ email: email });
    if (emailExists.length > 0) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name: name,
      phone: phone,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

const loginUser = async (phone, password) => {
  try {
    const user = await UserModel.findOne({ phone: phone });
    if (user.length === 0) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = jwtService.generalAccessToken({
      id: user._id,
    });
    return { user: user, token: token };
  } catch (error) {
    throw new Error(`Error logging in user: ${error.message}`);
  }
};

module.exports = {
  createUser,
  loginUser,
};
