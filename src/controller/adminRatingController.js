// controllers/admin/adminRatingController.js
const Rating = require("../models/Rating");
const mongoose = require("mongoose");

const adminRatingController = {
  // Lấy tất cả ratings với filter và pagination
  getAllRatings: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        rating,
        aspectRated,
        membershipPackage,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = {};
      if (rating) query.rating = Number(rating);
      if (aspectRated) query.aspectRated = aspectRated;
      if (membershipPackage) query.membershipPackage = membershipPackage;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      // Execute query với population
      const ratings = await Rating.find(query)
        .populate("user", "name email picture membershipPackage")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Rating.countDocuments(query);

      res.json({
        status: "OK",
        data: {
          ratings,
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

  // Xóa rating (vi phạm, spam, không phù hợp)
  deleteRating: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body; // Lý do xóa

      const rating = await Rating.findById(id);

      if (!rating) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

      // Log việc xóa (có thể lưu vào collection khác)
      console.log(
        `Admin ${req.user.id} deleted rating ${id} for reason: ${reason}`
      );

      await Rating.findByIdAndDelete(id);

      res.json({
        status: "OK",
        message: "Xóa đánh giá thành công",
        data: {
          deletedRating: rating,
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

  // Lấy thống kê rating tổng quan cho dashboard
  getRatingDashboard: async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;

      // Build date filter
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
      }

      // Thống kê tổng quan
      const overallStats = await Rating.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            totalRecommend: {
              $sum: { $cond: ["$wouldRecommend", 1, 0] },
            },
          },
        },
      ]);

      // Thống kê theo aspect
      const aspectStats = await Rating.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$aspectRated",
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
        { $sort: { average: -1 } },
      ]);

      // Thống kê theo membership
      const membershipStats = await Rating.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$membershipPackage",
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
        { $sort: { average: -1 } },
      ]);

      // Phân bố rating
      const distribution = await Rating.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Rating theo thời gian (7 ngày gần nhất)
      const last7Days = await Rating.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Format response
      const stats = overallStats[0] || {
        totalRatings: 0,
        averageRating: 0,
        totalRecommend: 0,
      };

      res.json({
        status: "OK",
        data: {
          overview: {
            totalRatings: stats.totalRatings,
            averageRating: Math.round(stats.averageRating * 10) / 10,
            recommendationRate:
              stats.totalRatings > 0
                ? Math.round(
                    (stats.totalRecommend / stats.totalRatings) * 100
                  ) + "%"
                : "0%",
          },
          aspectStats,
          membershipStats,
          distribution: {
            1: distribution.find((d) => d._id === 1)?.count || 0,
            2: distribution.find((d) => d._id === 2)?.count || 0,
            3: distribution.find((d) => d._id === 3)?.count || 0,
            4: distribution.find((d) => d._id === 4)?.count || 0,
            5: distribution.find((d) => d._id === 5)?.count || 0,
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

  // Export ratings data (CSV)
  exportRatings: async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;

      const query = {};
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const ratings = await Rating.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      // Format cho CSV
      const csvData = ratings.map((r) => ({
        "User Name": r.user.name,
        "User Email": r.user.email,
        Rating: r.rating,
        Aspect: r.aspectRated,
        Comment: r.comment,
        Membership: r.membershipPackage,
        "Would Recommend": r.wouldRecommend ? "Yes" : "No",
        "Days Used": r.daysUsed,
        "Created Date": new Date(r.createdAt).toLocaleDateString(),
        "Created Time": new Date(r.createdAt).toLocaleTimeString(),
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

module.exports = adminRatingController;
