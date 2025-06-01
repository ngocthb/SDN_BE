const UserServices = require("../services/UserService");
// const UserModel = require("../models/UserModel");

const createUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const response = await UserServices.createUser(
      name,
      phone,
      email,
      password
    );
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "User already exists" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const response = await UserServices.loginUser(phone, password);
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "Invalid phone or password" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
};
