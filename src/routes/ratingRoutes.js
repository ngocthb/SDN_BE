const express = require("express");
const router = express.Router();
const ratingController = require("../controller/ratingController");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/authMiddleware");
const { validateRating } = require("../middleware/validation");

// Public routes - không cần auth
// Lấy thống kê rating của platform (cho trang chủ)
router.get("/stats", ratingController.getPlatformRatingStats);

// Protected routes - cần auth
router.use(authUserMiddleware);

// Tạo rating mới
router.post("/", validateRating, ratingController.createRating);

// Lấy tất cả ratings của user hiện tại
router.get("/my-ratings", ratingController.getMyRatings);

// Lấy rating theo ID
router.get("/:id", ratingController.getRatingById);

// Cập nhật rating (chỉ người tạo mới được update trong 24h)
router.put("/:id", validateRating, ratingController.updateRating);

// Xóa rating (chỉ người tạo hoặc admin mới được xóa)
router.delete("/:id", ratingController.deleteRating);

// Admin routes - cần auth admin
router.get(
  "/admin/recent",
  authAdminMiddleware,
  ratingController.getRecentRatings
);

module.exports = router;
