// routes/admin/AdminUserRoutes.js
const express = require("express");
const router = express.Router();
const adminUserController = require("../controller/AdminUserController");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/authMiddleware");

// Tất cả routes đều cần auth user + admin
router.use(authUserMiddleware);
router.use(authAdminMiddleware);

// User management
router.get("/", adminUserController.getAllUsers); // Lấy danh sách users
router.get("/statistics", adminUserController.getUserStatistics); // Dashboard thống kê
router.get("/export", adminUserController.exportUsers); // Export CSV
router.get("/:id", adminUserController.getUserById); // Xem chi tiết user

router.put("/:id/status", adminUserController.updateUserStatus); // Active/Deactive user
router.put("/:id/role", adminUserController.updateUserRole); // Cập nhật role
router.put("/:id/reset-password", adminUserController.resetUserPassword); // Reset password
router.delete("/:id", adminUserController.deleteUser); // Soft delete user

module.exports = router;
