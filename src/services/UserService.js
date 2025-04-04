const UserModel = require("../models/UserModel");
const RoleModel = require("../models/RolesModel");
const cloudinary = require("../config/cloudinaryConfig");

const bcrypt = require("bcrypt");
const jwtService = require("./JwtService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { user_name, password, email, department, job_rank, salary, role } =
      newUser;
    try {
      const checkUser = await UserModel.findOne({ email: email });
      if (checkUser) {
        reject({
          status: "ERR",
          message: "Email already exists",
        });
        return;
      }
      // mã hóa cái password
      const hash = bcrypt.hashSync(password, 10);

      let roleData;
      if (role) {
        roleData = await RoleModel.findOne({ name: role });
        if (!roleData) {
          throw new Error("Role not found");
        }
      }
      const createUser = await UserModel.create({
        user_name,
        password: hash,
        email: email,
        department: department,
        job_rank: job_rank,
        salary: salary,
        avatar:
          "https://res.cloudinary.com/dievplv1n/image/upload/v1739629508/defaultAvatar.jpg",
        role_id: roleData._id,
      });
      const dataUser = await UserModel.findById(createUser._id).populate(
        "role_id",
        "name -_id"
      );

      const dataOutput = {
        _id: dataUser._id,
        user_name: dataUser.user_name,
        department: dataUser.department,
        job_rank: dataUser.job_rank,
        salary: dataUser.salary,
        password: dataUser.password,
        email: dataUser.email,
        role_name: dataUser.role_id.name,
        avatar: dataUser.avatar,
        status: dataUser.status,
        createdAt: dataUser.createdAt,
        updatedAt: dataUser.updatedAt,
      };

      if (createUser) {
        resolve({
          status: "OK",
          message: "Success create user",
          data: dataOutput,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;

    try {
      const checkUser = await UserModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!checkUser) {
        reject({
          status: "ERR",
          message: "Account does not exist",
        });
      }
      if (checkUser.status === false) {
        reject({
          status: "ERR",
          message: "Account is blocked",
        });
      }
      const checkPassword = bcrypt.compareSync(password, checkUser.password);
      if (!checkPassword) {
        reject({
          status: "ERR",
          message: "Password is incorrect",
        });
      }

      const accessToken = await jwtService.generalAccessToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });

      const dataUser = await UserModel.findById(checkUser._id).populate(
        "role_id",
        "name -_id"
      );

      const dataOutput = {
        _id: dataUser._id,
        user_name: dataUser.user_name,
        department: dataUser.department,
        job_rank: dataUser.job_rank,
        salary: dataUser.salary,
        password: dataUser.password,
        role_name: dataUser.role_id.name,
        avatar: dataUser.avatar,
        status: dataUser.status,
        createdAt: dataUser.createdAt,
        updatedAt: dataUser.updatedAt,
      };

      // const refreshToken = await jwtService.generalRefreshToken({
      //   id: checkUser._id,
      //   isAdmin: checkUser.isAdmin,
      // });

      resolve({
        status: "OK",
        message: "Login success",
        data: dataOutput,
        token: {
          access_token: accessToken,
          // refresh_token: refreshToken,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = async (id, data, file, role) => {
  try {
    const checkUser = await UserModel.findById(id);
    if (!checkUser) {
      return { status: "ERR", message: "User does not exist" };
    }
    if (data.email) {
      const userWithSameName = await UserModel.findOne({
        email: data.email,
      });
      if (userWithSameName && userWithSameName._id.toString() !== id) {
        return { status: "ERR", message: "Email already exists" };
      }
    }

    if (role !== "Administrator") {
      if (
        data.role ||
        data.status ||
        data.department ||
        data.job_rank ||
        data.salary
      ) {
        return {
          status: "ERR",
          message: "You are not allowed to change this information",
        };
      }
    }
    let roleData;
    if (data.role) {
      roleData = await RoleModel.findOne({ name: data.role });
      if (!roleData) {
        return { status: "ERR", message: "Role not found" };
      } else {
        data.role_id = roleData._id;
      }
    }

    if (file) {
      if (checkUser.avatar) {
        const oldImageId = checkUser.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`avatars/${oldImageId}`);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "avatars" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(file.buffer);
      });

      data.avatar = uploadResult.secure_url;
    }

    const isStrictPassword = (password) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };

    console.log(data.password);
    if (data.password) {
      if (!isStrictPassword(data.password)) {
        return {
          status: "ERR",
          message:
            "Password must contain at least 8 characters, including uppercase and number",
        };
      }

      if (data.password !== checkUser.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }
    }

    const updateData = await UserModel.findByIdAndUpdate(
      id,
      {
        user_name: data.user_name || checkUser.user_name,
        email: data.email || checkUser.email,
        password: data.password || checkUser.password,
        role_id: data.role_id || checkUser.role_id,
        avatar: data.avatar || checkUser.avatar,
        status: data.status || checkUser.status,
        department: data.department || checkUser.department,
        job_rank: data.job_rank || checkUser.job_rank,
        salary: data.salary || checkUser.salary,
      },
      { new: true }
    );

    const dataUser = await UserModel.findById(updateData._id).populate(
      "role_id",
      "name -_id"
    );

    const dataOutput = {
      _id: dataUser._id,
      user_name: dataUser.user_name,
      password: dataUser.password,
      role_name: dataUser.role_id.name,
      avatar: dataUser.avatar,
      status: dataUser.status,
      department: dataUser.department,
      job_rank: dataUser.job_rank,
      salary: dataUser.salary,
      createdAt: dataUser.createdAt,
      updatedAt: dataUser.updatedAt,
    };

    return {
      status: "OK",
      message: "Update success",
      data: dataOutput,
    };
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const getAllUser = (page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const listUser = await UserModel.find().populate("role_id", "name -_id");
      let listUserData = listUser.map((user) => {
        return {
          _id: user._id,
          user_name: user.user_name,
          password: user.password,
          role_name: user.role_id.name,
          department: user.department,
          job_rank: user.job_rank,
          salary: user.salary,
          avatar: user.avatar,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });

      listUserData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const dataOutput = {
        user: listUserData,
        total: {
          currentPage: page,
          totalUser: listUserData.length,
          totalPage: Math.ceil(listUserData.length / limit),
        },
      };
      if (page !== undefined || limit !== undefined) {
        dataOutput.user = listUserData.slice((page - 1) * limit, page * limit);
        dataOutput.total.currentPage = page;
      }
      resolve({
        status: "OK",
        message: "Successfully get all user",
        data: dataOutput,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDetail = await UserModel.findById(id);
      if (!userDetail) {
        resolve({
          status: "ERR",
          message: "User does not exist",
        });
      }
      const dataUser = await UserModel.findById(userDetail._id).populate(
        "role_id",
        "name -_id"
      );

      const dataOutput = {
        _id: dataUser._id,
        user_name: dataUser.user_name,
        password: dataUser.password,
        department: dataUser.department,
        job_rank: dataUser.job_rank,
        salary: dataUser.salary,
        role_name: dataUser.role_id.name,
        avatar: dataUser.avatar,
        status: dataUser.status,
        createdAt: dataUser.createdAt,
        updatedAt: dataUser.updatedAt,
      };
      if (!userDetail) {
        resolve({
          status: "ERR",
          message: "User does not exist",
        });
      }
      resolve({
        status: "OK",
        message: "Successfully get user",
        data: dataOutput,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const changePassword = async (userID, old_password, new_password) => {
  try {
    const checkUser = await UserModel.findById(userID);
    if (!checkUser) {
      return { status: "ERR", message: "User does not exist" };
    }
    const checkPassword = bcrypt.compareSync(old_password, checkUser.password);
    if (!checkPassword) {
      return { status: "ERR", message: "Old password is incorrect" };
    }
    const isStrictPassword = (password) => {
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    };
    if (!isStrictPassword(new_password)) {
      return {
        status: "ERR",
        message:
          "Password must contain at least 8 characters, including uppercase and number",
      };
    }
    const hash = bcrypt.hashSync(new_password, 10);
    const updateData = await UserModel.findByIdAndUpdate(
      userID,
      {
        password: hash,
      },
      { new: true }
    );
    const dataUser = await UserModel.findById(updateData._id).populate(
      "role_id",
      "name -_id"
    );
    const dataOutput = {
      _id: dataUser._id,
      email: dataUser.email,
      user_name: dataUser.user_name,
      password: dataUser.password,
      role_name: dataUser.role_id.name,
      avatar: dataUser.avatar,
      status: dataUser.status,
      department: dataUser.department,
      job_rank: dataUser.job_rank,
      salary: dataUser.salary,
      createdAt: dataUser.createdAt,
      updatedAt: dataUser.updatedAt,
    };
    return {
      status: "OK",
      message: "Change password success",
      data: dataOutput,
    };
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  getAllUser,
  getUserById,
  changePassword,
};
