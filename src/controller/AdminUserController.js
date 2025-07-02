// controller/admin/AdminUserController.js
const AdminUserService = require("../services/AdminUserService");

const adminUserController = {
  // Lấy danh sách users
  getAllUsers: async (req, res) => {
    try {
      const filters = req.query;
      const result = await AdminUserService.getAllUsers(filters);

      return res.status(200).json({
        status: "OK",
        message: "Get users successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy chi tiết user
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: "ERR",
          message: "User ID is required",
        });
      }

      const user = await AdminUserService.getUserById(id);

      return res.status(200).json({
        status: "OK",
        message: "Get user successfully",
        data: user,
      });
    } catch (error) {
      return res.status(404).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Cập nhật status user
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          status: "ERR",
          message: "User ID is required",
        });
      }

      if (status === undefined) {
        return res.status(400).json({
          status: "ERR",
          message: "Status is required",
        });
      }

      const user = await AdminUserService.updateUserStatus(id, status);

      return res.status(200).json({
        status: "OK",
        message: `User ${status ? "activated" : "deactivated"} successfully`,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Cập nhật role user
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin, isCoach } = req.body;

      if (!id) {
        return res.status(400).json({
          status: "ERR",
          message: "User ID is required",
        });
      }

      const user = await AdminUserService.updateUserRole(id, {
        isAdmin,
        isCoach,
      });

      return res.status(200).json({
        status: "OK",
        message: "Update user role successfully",
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Reset password cho user
  resetUserPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id) {
        return res.status(400).json({
          status: "ERR",
          message: "User ID is required",
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          status: "ERR",
          message: "Password must be at least 6 characters",
        });
      }

      const result = await AdminUserService.adminResetPassword(id, newPassword);

      return res.status(200).json({
        status: "OK",
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Xóa user (soft delete)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: "ERR",
          message: "User ID is required",
        });
      }

      const result = await AdminUserService.deleteUser(id);

      return res.status(200).json({
        status: "OK",
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Dashboard thống kê users
  getUserStatistics: async (req, res) => {
    try {
      const statistics = await AdminUserService.getUserStatistics();

      return res.status(200).json({
        status: "OK",
        message: "Get user statistics successfully",
        data: statistics,
      });
    } catch (error) {
      return res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Export users data
  exportUsers: async (req, res) => {
    try {
      const filters = req.query;
      const csvData = await AdminUserService.exportUsers(filters);

      return res.status(200).json({
        status: "OK",
        message: "Export users data successfully",
        data: csvData,
      });
    } catch (error) {
      return res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },
};

module.exports = adminUserController;
