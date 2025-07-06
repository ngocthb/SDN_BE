const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");

const adminUserService = {
  // Lấy danh sách users với filters
  getAllUsers: async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status,
        role,
        gender,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build query
      const query = {};

      // Search by name or email
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Filter by status
      if (status !== undefined) {
        query.status = status === "true" || status === true;
      }

      // Filter by role
      if (role) {
        if (role === "admin") query.isAdmin = true;
        else if (role === "coach") query.isCoach = true;
        else if (role === "user") {
          query.isAdmin = { $ne: true };
          query.isCoach = { $ne: true };
        }
      }

      // Filter by gender
      if (gender !== undefined) {
        query.gender = gender === "true" || gender === true;
      }

      // Execute query
      const users = await UserModel.find(query)
        .select("-passwordHash -verifyOTP -verifyOTPExpires")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await UserModel.countDocuments(query);

      return {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy thông tin user theo ID
  getUserById: async (userId) => {
    try {
      const user = await UserModel.findById(userId).select(
        "-passwordHash -verifyOTP -verifyOTPExpires"
      );

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Cập nhật status user (active/inactive)
  updateUserStatus: async (userId, status) => {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.status = status;
      await user.save();

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Cập nhật role user
  updateUserRole: async (userId, roleData) => {
    try {
      const { isAdmin, isCoach } = roleData;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (isAdmin !== undefined) user.isAdmin = isAdmin;
      if (isCoach !== undefined) user.isCoach = isCoach;

      await user.save();

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Reset password cho user
  adminResetPassword: async (userId, newPassword) => {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedPassword;
      await user.save();

      return { message: "Password reset successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Xóa user (soft delete - chuyển status = false)
  deleteUser: async (userId) => {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Không cho xóa admin
      if (user.isAdmin) {
        throw new Error("Cannot delete admin user");
      }

      user.status = false;
      await user.save();

      return { message: "User deactivated successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Thống kê users
  getUserStatistics: async () => {
    try {
      // Tổng quan
      const totalUsers = await UserModel.countDocuments();
      const activeUsers = await UserModel.countDocuments({ status: true });
      const inactiveUsers = await UserModel.countDocuments({ status: false });

      // Theo role
      const admins = await UserModel.countDocuments({ isAdmin: true });
      const coaches = await UserModel.countDocuments({ isCoach: true });
      const normalUsers = await UserModel.countDocuments({
        isAdmin: { $ne: true },
        isCoach: { $ne: true },
      });

      // Theo gender
      const maleUsers = await UserModel.countDocuments({ gender: false });
      const femaleUsers = await UserModel.countDocuments({ gender: true });
      const unknownGender = await UserModel.countDocuments({
        gender: { $exists: false },
      });

      // Users mới trong 30 ngày
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = await UserModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Trend đăng ký 7 ngày gần nhất
      const registrationTrend = await UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        overview: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          newLast30Days: newUsers,
        },
        byRole: {
          admins,
          coaches,
          users: normalUsers,
        },
        byGender: {
          male: maleUsers,
          female: femaleUsers,
          unknown: unknownGender,
        },
        registrationTrend,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Export users data
  exportUsers: async (filters = {}) => {
    try {
      const { status, role, dateFrom, dateTo } = filters;

      const query = {};
      if (status !== undefined) query.status = status === "true";
      if (role) {
        if (role === "admin") query.isAdmin = true;
        else if (role === "coach") query.isCoach = true;
        else if (role === "user") {
          query.isAdmin = { $ne: true };
          query.isCoach = { $ne: true };
        }
      }
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const users = await UserModel.find(query)
        .select("-passwordHash -verifyOTP -verifyOTPExpires")
        .sort({ createdAt: -1 });

      // Format for CSV
      const csvData = users.map((user) => ({
        Name: user.name,
        Email: user.email,
        Gender:
          user.gender === true
            ? "Female"
            : user.gender === false
            ? "Male"
            : "Not specified",
        "Date of Birth": user.dateOfBirth
          ? new Date(user.dateOfBirth).toLocaleDateString()
          : "",
        Role: user.isAdmin ? "Admin" : user.isCoach ? "Coach" : "User",
        Status: user.status ? "Active" : "Inactive",
        "Registered Date": new Date(user.createdAt).toLocaleDateString(),
      }));

      return csvData;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = adminUserService;
