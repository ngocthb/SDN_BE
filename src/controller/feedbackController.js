const Feedback = require("../models/Feedback");

const feedbackController = {
  // Tạo feedback mới
  createFeedback: async (req, res) => {
    try {
      const { type, subject, message, priority } = req.body;
      const userId = req.user._id || req.user.id;

      const newFeedback = new Feedback({
        user: userId,
        type,
        subject,
        message,
        priority: priority || "medium",
      });

      await newFeedback.save();
      await newFeedback.populate("user", "name email picture");

      res.status(201).json({
        status: "OK",
        message: "Gửi phản hồi thành công",
        data: newFeedback,
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

      res.json({
        status: "OK",
        data: {
          feedback,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
          },
        },
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
      const feedback = await Feedback.findById(req.params.id)
        .populate("user", "name email picture")
        .populate("adminResponse.respondedBy", "name email picture");

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      // Check quyền xem - sử dụng đúng cấu trúc từ JWT
      const isOwner = feedback.user._id.toString() === req.user.id;
      const isAdmin = req.user.isAdmin === true;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          status: "ERR",
          message: "Bạn không có quyền xem phản hồi này",
        });
      }

      res.json({
        status: "OK",
        data: feedback,
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

      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      // Kiểm tra quyền và status
      if (feedback.user.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "ERR",
          message: "Bạn không có quyền sửa phản hồi này",
        });
      }

      if (feedback.status !== "pending") {
        return res.status(400).json({
          status: "ERR",
          message: "Chỉ có thể sửa phản hồi ở trạng thái chờ xử lý",
        });
      }

      // Update
      feedback.subject = subject || feedback.subject;
      feedback.message = message || feedback.message;
      feedback.priority = priority || feedback.priority;

      await feedback.save();
      await feedback.populate("user", "name email picture");

      res.json({
        status: "OK",
        message: "Cập nhật phản hồi thành công",
        data: feedback,
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

      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      // Kiểm tra quyền và status
      if (feedback.user.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "ERR",
          message: "Bạn không có quyền xóa phản hồi này",
        });
      }

      if (feedback.status !== "pending") {
        return res.status(400).json({
          status: "ERR",
          message: "Chỉ có thể xóa phản hồi ở trạng thái chờ xử lý",
        });
      }

      await Feedback.findByIdAndDelete(feedbackId);

      res.json({
        status: "OK",
        message: "Xóa phản hồi thành công",
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
