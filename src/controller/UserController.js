const UserServices = require("../services/UserService");
const UserModel = require("../models/UserModel");

const checkRole = async (userID) => {
  try {
    const user = await UserModel.findById(userID).populate(
      "role_id",
      "name -_id"
    );
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    return { status: "OK", role: user.role_id.name, id: user._id };
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const createUser = async (req, res) => {
  try {
    const { user_name, password, email, department, job_rank, salary, role } =
      req.body;
    if (
      !user_name ||
      !password ||
      !email ||
      !department ||
      !job_rank ||
      !salary ||
      !role
    ) {
      return res
        .status(200)
        .json({ status: "ERR", message: "All fields are required" });
    }

    const isStrictPassword = (password) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };
    if (!isStrictPassword(password)) {
      return res.status(200).json({
        status: "ERR",
        message:
          "Password must contain at least 8 characters, including uppercase and number",
      });
    }
    const isStrictEmail = (email) => {
      const strictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return strictRegex.test(email);
    };
    if (!isStrictEmail(email)) {
      return res.status(200).json({ status: "ERR", message: "Invalid email " });
    }
    const response = await UserServices.createUser(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const isStrictEmail = (email) => {
      const strictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return strictRegex.test(email);
    };
    if (!isStrictEmail(email)) {
      return res.status(200).json({ status: "ERR", message: "Invalid email " });
    }
    const response = await UserServices.loginUser(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const file = req.file;
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    } else if (role.role !== "Administrator" && userID !== id) {
      return res
        .status(200)
        .json({ status: "ERR", message: "You are not authorized" });
    }
    if (!id) {
      return res.status(400).json({ status: "ERR", message: "Id is required" });
    }

    const response = await UserServices.updateUser(id, data, file, role.role);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const response = await UserServices.getAllUser(page, limit);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    var id = req.params.id;
    const response = await UserServices.getUserById(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getUserByToken = async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await UserServices.getUserById(userID);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userID = req.user.id;
    if (!old_password || !new_password) {
      return res
        .status(200)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const isStrictPassword = (password) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };
    if (!isStrictPassword(new_password)) {
      return res.status(200).json({
        status: "ERR",
        message:
          "Password must contain at least 8 characters, including uppercase and number",
      });
    }
    const response = await UserServices.changePassword(
      userID,
      old_password,
      new_password
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  getAllUser,
  getUserById,
  getUserByToken,
  changePassword,
};
