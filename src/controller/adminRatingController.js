// controllers/admin/adminRatingController.js
const Rating = require("../models/Rating");
const RatingService = require("../services/RatingService");
const mongoose = require("mongoose");

const adminRatingController = {
  // Lấy tất cả ratings với filter và pagination (Enhanced với subscription support)
  getAllRatings: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        rating,
        aspectRated,
        membershipPackage,
        membershipType,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
      } = req.query;

      if (rating) {
        rating = parseInt(rating, 10);
      }

      // Ép kiểu về số
      page = Number(page) || 1;
      limit = Number(limit) || 10;

      // Sử dụng RatingService method đã enhanced
      const result = await RatingService.getAllRatings(
        {
          rating,
          aspectRated,
          membershipPackage,
          membershipType,
          dateFrom,
          dateTo,
          search,
        },
        page,
        limit
      );

      // Post-process để ensure proper population
      const enhancedRatings = await Rating.populate(result.ratings, [
        { path: "user", select: "name email picture" },
        {
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price",
          },
        },
      ]);

      res.json({
        status: "OK",
        data: {
          ratings: enhancedRatings,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error("Admin getAllRatings error:", error);
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

      const result = await RatingService.deleteRating(id, req.user.id, true); // isAdmin = true

      // Log việc xóa (có thể lưu vào collection khác)
      console.log(
        `Admin ${req.user.id} deleted rating ${id} for reason: ${reason}`
      );

      res.json({
        status: "OK",
        message: result.message,
        data: {
          deletedBy: req.user.id,
          reason: reason || "No reason provided",
        },
      });
    } catch (error) {
      console.error("Admin deleteRating error:", error);
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Enhanced dashboard với subscription support
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

      // Enhanced aggregation pipeline với subscription lookup
      const pipeline = [
        { $match: dateFilter },
        {
          $lookup: {
            from: "subscriptions",
            localField: "subscription",
            foreignField: "_id",
            as: "subscriptionInfo",
          },
        },
        {
          $lookup: {
            from: "memberships",
            localField: "subscriptionInfo.membershipId",
            foreignField: "_id",
            as: "membershipInfo",
          },
        },
        {
          $addFields: {
            membershipCategory: {
              $cond: {
                if: {
                  $and: [
                    { $gt: [{ $size: "$subscriptionInfo" }, 0] },
                    {
                      $eq: [
                        { $arrayElemAt: ["$subscriptionInfo.status", 0] },
                        "active",
                      ],
                    },
                    { $gt: [{ $size: "$membershipInfo" }, 0] },
                  ],
                },
                then: {
                  $ifNull: [
                    { $arrayElemAt: ["$membershipInfo.name", 0] },
                    "Premium Subscription",
                  ],
                },
                else: {
                  $cond: {
                    if: { $ne: ["$membershipPackage", "free"] },
                    then: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$membershipPackage", "basic"] },
                            then: "Basic Plan",
                          },
                          {
                            case: { $eq: ["$membershipPackage", "premium"] },
                            then: "Premium Plan",
                          },
                          {
                            case: { $eq: ["$membershipPackage", "vip"] },
                            then: "VIP Plan",
                          },
                        ],
                        default: "$membershipPackage",
                      },
                    },
                    else: "Free Users",
                  },
                },
              },
            },
          },
        },
      ];

      // Thống kê tổng quan
      const overallStats = await Rating.aggregate([
        ...pipeline,
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
        ...pipeline,
        {
          $group: {
            _id: "$aspectRated",
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
        { $sort: { average: -1 } },
      ]);

      // Enhanced membership stats với real names
      const membershipStats = await Rating.aggregate([
        ...pipeline,
        {
          $group: {
            _id: "$membershipCategory",
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
          membershipStats, // Now contains real membership names
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
      console.error("Admin dashboard error:", error);
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Enhanced export với subscription data
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
        .populate({
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price",
          },
        })
        .sort({ createdAt: -1 });

      // Enhanced CSV data với subscription info
      const csvData = ratings.map((r) => ({
        "User Name": r.user?.name || "Unknown",
        "User Email": r.user?.email || "Unknown",
        Rating: r.rating,
        Aspect: r.aspectRated,
        Comment: r.comment || "",
        "Membership Type":
          r.subscription?.membershipId?.name || r.membershipPackage || "Free",
        "Subscription Status": r.subscription?.status || "N/A",
        "Would Recommend": r.wouldRecommend ? "Yes" : "No",
        "Days Used": r.daysUsed || 0,
        "Created Date": new Date(r.createdAt).toLocaleDateString(),
        "Created Time": new Date(r.createdAt).toLocaleTimeString(),
      }));

      res.json({
        status: "OK",
        message: "Data ready for export",
        data: csvData,
      });
    } catch (error) {
      console.error("Admin export error:", error);
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // New method: Lấy thống kê chi tiết cho admin
  getDetailedStats: async (req, res) => {
    try {
      // Sử dụng existing platform stats
      const platformStats = await RatingService.getPlatformStats(req.query);
      const membershipStats = await RatingService.getStatsByMembership();

      res.json({
        status: "OK",
        data: {
          platform: platformStats,
          membership: membershipStats,
        },
      });
    } catch (error) {
      console.error("Admin detailed stats error:", error);
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },
};

module.exports = adminRatingController;
