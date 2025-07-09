const Feedback = require("../models/Feedback");

const feedbackService = {
  // Tạo feedback mới
  createFeedback: async (userId, { type, subject, message, priority }) => {
    try {
      const newFeedback = new Feedback({
        user: userId,
        type,
        subject,
        message,
        priority: priority || "medium",
      });

      await newFeedback.save();
      await newFeedback.populate("user", "name email picture");

      return {
        success: true,
        data: newFeedback,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Lấy feedback của user với pagination và filter
  getMyFeedback: async (userId, { page = 1, limit = 10, status, type }) => {
    try {
      // Build query
      const query = { user: userId };
      if (status) query.status = status;
      if (type) query.type = type;

      const feedback = await Feedback.find(query)
        .populate("adminResponse.respondedBy", "name email picture")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Feedback.countDocuments(query);

      return {
        success: true,
        data: {
          feedback,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Lấy feedback theo ID
  getFeedbackById: async (feedbackId) => {
    try {
      const feedback = await Feedback.findById(feedbackId)
        .populate("user", "name email picture")
        .populate("adminResponse.respondedBy", "name email picture");

      if (!feedback) {
        return {
          success: false,
          error: "Không tìm thấy phản hồi",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Kiểm tra quyền truy cập feedback
  checkFeedbackPermission: (feedback, userId, isAdmin) => {
    const isOwner = feedback.user._id.toString() === userId.toString();

    if (!isOwner && !isAdmin) {
      return {
        hasPermission: false,
        error: "Bạn không có quyền xem phản hồi này",
        statusCode: 403,
      };
    }

    return {
      hasPermission: true,
      isOwner,
    };
  },

  // Cập nhật feedback
  updateFeedback: async (
    feedbackId,
    userId,
    { subject, message, priority }
  ) => {
    try {
      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        return {
          success: false,
          error: "Không tìm thấy phản hồi",
          statusCode: 404,
        };
      }

      // Kiểm tra quyền
      if (feedback.user.toString() !== userId.toString()) {
        return {
          success: false,
          error: "Bạn không có quyền sửa phản hồi này",
          statusCode: 403,
        };
      }

      // Kiểm tra trạng thái
      if (feedback.status !== "pending") {
        return {
          success: false,
          error: "Chỉ có thể sửa phản hồi ở trạng thái chờ xử lý",
          statusCode: 400,
        };
      }

      // Update
      feedback.subject = subject || feedback.subject;
      feedback.message = message || feedback.message;
      feedback.priority = priority || feedback.priority;

      await feedback.save();
      await feedback.populate("user", "name email picture");

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Xóa feedback
  deleteFeedback: async (feedbackId, userId) => {
    try {
      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        return {
          success: false,
          error: "Không tìm thấy phản hồi",
          statusCode: 404,
        };
      }

      // Kiểm tra quyền
      if (feedback.user.toString() !== userId.toString()) {
        return {
          success: false,
          error: "Bạn không có quyền xóa phản hồi này",
          statusCode: 403,
        };
      }

      // Kiểm tra trạng thái
      if (feedback.status !== "pending") {
        return {
          success: false,
          error: "Chỉ có thể xóa phản hồi ở trạng thái chờ xử lý",
          statusCode: 400,
        };
      }

      await Feedback.findByIdAndDelete(feedbackId);

      return {
        success: true,
        message: "Xóa phản hồi thành công",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Lấy tất cả feedback (cho admin)
  getAllFeedback: async ({ page = 1, limit = 10, status, type, priority }) => {
    try {
      // Build query
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (priority) query.priority = priority;

      const feedback = await Feedback.find(query)
        .populate("user", "name email picture")
        .populate("adminResponse.respondedBy", "name email picture")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Feedback.countDocuments(query);

      return {
        success: true,
        data: {
          feedback,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Admin phản hồi feedback
  adminResponseFeedback: async (feedbackId, adminId, { response, status }) => {
    try {
      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        return {
          success: false,
          error: "Không tìm thấy phản hồi",
          statusCode: 404,
        };
      }

      feedback.adminResponse = {
        message: response,
        respondedBy: adminId,
        respondedAt: new Date(),
      };

      if (status) {
        feedback.status = status;
      }

      await feedback.save();
      await feedback.populate("user", "name email picture");
      await feedback.populate(
        "adminResponse.respondedBy",
        "name email picture"
      );

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = feedbackService;
