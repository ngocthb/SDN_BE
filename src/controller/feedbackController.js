const feedbackService = require("../services/FeedbackService");

const feedbackController = {
  // Tạo feedback mới
  createFeedback: async (req, res) => {
    try {
      const { type, subject, message, priority } = req.body;
      const userId = req.user._id || req.user.id;

      const result = await feedbackService.createFeedback(userId, {
        type,
        subject,
        message,
        priority,
      });

      if (!result.success) {
        return res.status(500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.status(201).json({
        status: "OK",

        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy feedback của user
  getMyFeedback: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const userId = req.user._id || req.user.id;

      const result = await feedbackService.getMyFeedback(userId, {
        page,
        limit,
        status,
        type,
      });

      if (!result.success) {
        return res.status(500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.json({
        status: "OK",
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy feedback theo ID
  getFeedbackById: async (req, res) => {
    try {
      const feedbackId = req.params.id;
      const userId = req.user._id || req.user.id;
      const isAdmin = req.user.isAdmin === true;

      const result = await feedbackService.getFeedbackById(feedbackId);

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          status: "ERR",
          message: result.error,
        });
      }

      // Kiểm tra quyền xem
      const permissionCheck = feedbackService.checkFeedbackPermission(
        result.data,
        userId,
        isAdmin
      );

      if (!permissionCheck.hasPermission) {
        return res.status(permissionCheck.statusCode || 403).json({
          status: "ERR",
          message: permissionCheck.error,
        });
      }

      res.json({
        status: "OK",
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Cập nhật feedback
  updateFeedback: async (req, res) => {
    try {
      const { subject, message, priority } = req.body;
      const feedbackId = req.params.id;
      const userId = req.user._id || req.user.id;

      const result = await feedbackService.updateFeedback(feedbackId, userId, {
        subject,
        message,
        priority,
      });

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.json({
        status: "OK",
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Xóa feedback
  deleteFeedback: async (req, res) => {
    try {
      const feedbackId = req.params.id;
      const userId = req.user._id || req.user.id;

      const result = await feedbackService.deleteFeedback(feedbackId, userId);

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.json({
        status: "OK",
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Lấy tất cả feedback (cho admin)
  getAllFeedback: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, type, priority } = req.query;

      const result = await feedbackService.getAllFeedback({
        page,
        limit,
        status,
        type,
        priority,
      });

      if (!result.success) {
        return res.status(500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.json({
        status: "OK",
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Admin phản hồi feedback
  adminResponseFeedback: async (req, res) => {
    try {
      const { response, status } = req.body;
      const feedbackId = req.params.id;
      const adminId = req.user._id || req.user.id;

      const result = await feedbackService.adminResponseFeedback(
        feedbackId,
        adminId,
        { response, status }
      );

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          status: "ERR",
          message: result.error,
        });
      }

      res.json({
        status: "OK",
        message: "Phản hồi thành công",
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },
};

module.exports = feedbackController;
