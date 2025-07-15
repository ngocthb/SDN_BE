const express = require("express");
const router = express.Router();
const ratingController = require("../controller/ratingController");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/authMiddleware");
const {
  validateRating,
  validateRatingStatsQuery,
  validatePagination,
} = require("../middleware/validation");

// ==================== PUBLIC ROUTES ====================
// Lấy thống kê rating của platform (cho trang chủ)
router.get(
  "/stats",
  validateRatingStatsQuery,
  ratingController.getPlatformRatingStats
);

// Lấy thống kê rating theo membership type (public)
router.get("/stats/membership", ratingController.getStatsByMembership);

// ==================== PROTECTED ROUTES (USER) ====================
router.use(authUserMiddleware);

// Check xem user có thể rating không (kiểm tra 30 ngày + subscription info)
router.get("/can-rate", ratingController.checkCanRate);

// Tạo rating mới (đã cập nhật để auto-link subscription)
router.post("/", validateRating, ratingController.createRating);

// Lấy tất cả ratings của user hiện tại (bao gồm subscription info)
router.get("/my-ratings", validatePagination, ratingController.getMyRatings);

// Lấy rating gần nhất của user hiện tại
router.get("/my-latest", ratingController.getUserLatestRating);

// Lấy rating theo ID (bao gồm subscription info)
router.get("/:id", ratingController.getRatingById);

// Cập nhật rating (chỉ người tạo mới được update trong 24h)
router.put("/:id", validateRating, ratingController.updateRating);

// Xóa rating (chỉ người tạo hoặc admin mới được xóa)
router.delete("/:id", ratingController.deleteRating);

// ==================== ADMIN ROUTES ====================
// Lấy ratings gần đây (cho admin dashboard)
router.get(
  "/admin/recent",
  authAdminMiddleware,
  validatePagination,
  ratingController.getRecentRatings
);

// Lấy tất cả ratings với filters và pagination (cho admin)
router.get(
  "/admin/all",
  authAdminMiddleware,
  validateRatingStatsQuery,
  ratingController.getAllRatings
);

module.exports = router;
