// controllers/admin/adminFeedbackController.js
const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");

const adminFeedbackController = {
  // Lấy tất cả feedback với filter
  getAllFeedback: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        priority,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const feedback = await Feedback.find(query)
        .populate("user", "name email picture membershipPackage")
        .populate("adminResponse.respondedBy", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Feedback.countDocuments(query);

      // Đếm theo status để hiển thị badges
      const statusCounts = await Feedback.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const counts = {
        pending: 0,
        "in-review": 0,
        resolved: 0,
        rejected: 0,
      };

      statusCounts.forEach((item) => {
        counts[item._id] = item.count;
      });

      res.json({
        status: "OK",
        data: {
          feedback,
          statusCounts: counts,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            limit: Number(limit),
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

  // Cập nhật status feedback
  updateFeedbackStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "in-review", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({
          status: "ERR",
          message: "Status không hợp lệ",
        });
      }

      const feedback = await Feedback.findById(id);

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      feedback.status = status;

      // Nếu chuyển sang resolved/rejected, tự động thêm thời gian
      if (status === "resolved" || status === "rejected") {
        if (!feedback.adminResponse) {
          feedback.adminResponse = {};
        }
        feedback.adminResponse.respondedAt = new Date();
        feedback.adminResponse.respondedBy = req.user.id;
      }

      await feedback.save();
      await feedback.populate(["user", "adminResponse.respondedBy"]);

      res.json({
        status: "OK",
        message: "Cập nhật trạng thái thành công",
        data: feedback,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Admin phản hồi feedback
  respondToFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const { message, status } = req.body;

      if (!message) {
        return res.status(400).json({
          status: "ERR",
          message: "Nội dung phản hồi là bắt buộc",
        });
      }

      const feedback = await Feedback.findById(id);

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      // Update admin response
      feedback.adminResponse = {
        message,
        respondedBy: req.user.id,
        respondedAt: new Date(),
      };

      // Update status nếu có
      if (status && ["in-review", "resolved", "rejected"].includes(status)) {
        feedback.status = status;
      }

      await feedback.save();
      await feedback.populate(["user", "adminResponse.respondedBy"]);

      res.json({
        status: "OK",
        message: "Phản hồi thành công",
        data: feedback,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Xóa feedback (chỉ trong trường hợp đặc biệt)
  deleteFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const feedback = await Feedback.findById(id);

      if (!feedback) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy phản hồi",
        });
      }

      // Log việc xóa
      console.log(
        `Admin ${req.user.id} deleted feedback ${id} for reason: ${reason}`
      );

      await Feedback.findByIdAndDelete(id);

      res.json({
        status: "OK",
        message: "Xóa phản hồi thành công",
        data: {
          deletedFeedback: feedback,
          deletedBy: req.user.id,
          reason: reason || "No reason provided",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Dashboard thống kê feedback
  getFeedbackDashboard: async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;

      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
      }

      // Thống kê theo type
      const typeStats = await Feedback.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      // Thống kê theo status
      const statusStats = await Feedback.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Thống kê theo priority
      const priorityStats = await Feedback.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]);

      // Thời gian phản hồi trung bình (cho feedback đã resolved)
      const responseTimeStats = await Feedback.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "resolved",
            "adminResponse.respondedAt": { $exists: true },
          },
        },
        {
          $project: {
            responseTime: {
              $subtract: ["$adminResponse.respondedAt", "$createdAt"],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: "$responseTime" },
            minResponseTime: { $min: "$responseTime" },
            maxResponseTime: { $max: "$responseTime" },
          },
        },
      ]);

      // Feedback trend (7 ngày gần nhất)
      const last7Days = await Feedback.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      // Format response time
      const responseTime = responseTimeStats[0];
      const formatTime = (ms) => {
        if (!ms) return "N/A";
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} ngày`;
        return `${hours} giờ`;
      };

      res.json({
        status: "OK",
        data: {
          overview: {
            total: typeStats.reduce((sum, item) => sum + item.count, 0),
            pending: statusStats.find((s) => s._id === "pending")?.count || 0,
            inReview:
              statusStats.find((s) => s._id === "in-review")?.count || 0,
            resolved: statusStats.find((s) => s._id === "resolved")?.count || 0,
            rejected: statusStats.find((s) => s._id === "rejected")?.count || 0,
          },
          typeBreakdown: {
            bug: typeStats.find((t) => t._id === "bug")?.count || 0,
            suggestion:
              typeStats.find((t) => t._id === "suggestion")?.count || 0,
            complaint: typeStats.find((t) => t._id === "complaint")?.count || 0,
            compliment:
              typeStats.find((t) => t._id === "compliment")?.count || 0,
            other: typeStats.find((t) => t._id === "other")?.count || 0,
          },
          priorityBreakdown: {
            urgent: priorityStats.find((p) => p._id === "urgent")?.count || 0,
            high: priorityStats.find((p) => p._id === "high")?.count || 0,
            medium: priorityStats.find((p) => p._id === "medium")?.count || 0,
            low: priorityStats.find((p) => p._id === "low")?.count || 0,
          },
          responseMetrics: {
            average: formatTime(responseTime?.avgResponseTime),
            fastest: formatTime(responseTime?.minResponseTime),
            slowest: formatTime(responseTime?.maxResponseTime),
          },
          trend: last7Days,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Export feedback data
  exportFeedback: async (req, res) => {
    try {
      const { dateFrom, dateTo, status, type } = req.query;

      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const feedback = await Feedback.find(query)
        .populate("user", "name email")
        .populate("adminResponse.respondedBy", "name")
        .sort({ createdAt: -1 });

      const csvData = feedback.map((f) => ({
        "User Name": f.user.name,
        "User Email": f.user.email,
        Type: f.type,
        Subject: f.subject,
        Message: f.message,
        Priority: f.priority,
        Status: f.status,
        "Admin Response": f.adminResponse?.message || "",
        "Responded By": f.adminResponse?.respondedBy?.name || "",
        "Created Date": new Date(f.createdAt).toLocaleDateString(),
        "Response Date": f.adminResponse?.respondedAt
          ? new Date(f.adminResponse.respondedAt).toLocaleDateString()
          : "",
      }));

      res.json({
        status: "OK",
        message: "Data ready for export",
        data: csvData,
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },
};

module.exports = adminFeedbackController;
