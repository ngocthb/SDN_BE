const RatingService = require("../services/RatingService");

const ratingController = {
  // Tạo rating mới cho platform
  createRating: async (req, res) => {
    try {
      const ratingData = req.body;
      const userId = req.user.id; // từ JWT payload

      const newRating = await RatingService.createRating(userId, ratingData);

      res.status(201).json({
        status: "OK",
        message:
          "Cảm ơn bạn đã đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ.",
        data: newRating,
      });
    } catch (error) {
      res.status(400).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy ratings của user hiện tại
  getMyRatings: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const result = await RatingService.getUserRatings(userId, page, limit);

      res.json({
        status: "OK",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy rating theo ID
  getRatingById: async (req, res) => {
    try {
      const rating = await RatingService.getRatingById(req.params.id);

      res.json({
        status: "OK",
        data: rating,
      });
    } catch (error) {
      const statusCode = error.message.includes("Không tìm thấy") ? 404 : 500;
      res.status(statusCode).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Cập nhật rating
  updateRating: async (req, res) => {
    try {
      const updateData = req.body;
      const ratingId = req.params.id;
      const userId = req.user.id;

      const updatedRating = await RatingService.updateRating(
        ratingId,
        userId,
        updateData
      );

      res.json({
        status: "OK",
        message: "Cập nhật đánh giá thành công",
        data: updatedRating,
      });
    } catch (error) {
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("Không tìm thấy")
        ? 404
        : error.message.includes("24 giờ")
        ? 400
        : 500;

      res.status(statusCode).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Xóa rating
  deleteRating: async (req, res) => {
    try {
      const ratingId = req.params.id;
      const userId = req.user.id;
      const isAdmin = req.user.isAdmin || false;

      await RatingService.deleteRating(ratingId, userId, isAdmin);

      res.json({
        status: "OK",
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("Không tìm thấy")
        ? 404
        : 500;

      res.status(statusCode).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Check xem user có thể rating không + thông tin subscription
  checkCanRate: async (req, res) => {
    try {
      const userId = req.user.id;

      const canRateInfo = await RatingService.canUserRate(userId);

      res.json({
        status: "OK",
        data: canRateInfo,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Thống kê rating của platform (Enhanced với membership support)
  getPlatformRatingStats: async (req, res) => {
    try {
      const filters = req.query;
      const stats = await RatingService.getPlatformStats(filters);

      res.json({
        status: "OK",
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy thống kê theo membership type
  getStatsByMembership: async (req, res) => {
    try {
      const stats = await RatingService.getStatsByMembership();

      res.json({
        status: "OK",
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy rating gần đây (cho admin dashboard)
  getRecentRatings: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const ratings = await RatingService.getRecentRatings(limit);

      res.json({
        status: "OK",
        data: ratings,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy tất cả ratings với filters (cho admin)
  getAllRatings: async (req, res) => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const result = await RatingService.getAllRatings(filters, page, limit);

      res.json({
        status: "OK",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy rating gần nhất của user
  getUserLatestRating: async (req, res) => {
    try {
      const userId = req.user.id;
      const rating = await RatingService.getUserLatestRating(userId);

      res.json({
        status: "OK",
        data: rating,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },
};

module.exports = ratingController;
