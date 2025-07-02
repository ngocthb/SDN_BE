const Rating = require("../models/Rating");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

const ratingController = {
  // Tạo rating mới cho platform
  createRating: async (req, res) => {
    try {
      const {
        rating,
        comment,
        aspectRated,
        membershipPackage,
        wouldRecommend,
      } = req.body;
      const userId = req.user.id; // từ JWT payload

      // Check xem user đã rating trong vòng 30 ngày chưa
      const hasRecent = await Rating.hasRecentRating(userId);
      if (hasRecent) {
        return res.status(400).json({
          status: "ERR",
          message:
            "Bạn đã đánh giá trong vòng 30 ngày qua. Vui lòng thử lại sau.",
        });
      }

      // Lấy thông tin user để tính số ngày sử dụng
      const user = await User.findById(userId);
      const daysUsed = Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      );

      // Tạo rating mới
      const newRating = new Rating({
        user: userId,
        rating,
        comment,
        aspectRated: aspectRated || "overall",
        membershipPackage,
        daysUsed,
        wouldRecommend: wouldRecommend !== false, // default true
      });

      await newRating.save();
      await newRating.populate("user", "name email picture");

      res.status(201).json({
        status: "OK",
        message:
          "Cảm ơn bạn đã đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ.",
        data: newRating,
      });
    } catch (error) {
      res.status(500).json({
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

      const ratings = await Rating.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Rating.countDocuments({ user: userId });

      res.json({
        status: "OK",
        data: {
          ratings,
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

  // Lấy rating theo ID
  getRatingById: async (req, res) => {
    try {
      const rating = await Rating.findById(req.params.id).populate(
        "user",
        "name email picture"
      );

      if (!rating) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

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

  // Cập nhật rating
  updateRating: async (req, res) => {
    try {
      const { rating, comment, aspectRated, wouldRecommend } = req.body;
      const ratingId = req.params.id;
      const userId = req.user.id;

      const existingRating = await Rating.findById(ratingId);

      if (!existingRating) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

      // Kiểm tra quyền
      if (existingRating.user.toString() !== userId) {
        return res.status(403).json({
          status: "ERR",
          message: "Bạn không có quyền sửa đánh giá này",
        });
      }

      // Chỉ cho phép sửa trong vòng 24h
      const hoursSinceCreated =
        (new Date() - existingRating.createdAt) / (1000 * 60 * 60);
      if (hoursSinceCreated > 672) {
        return res.status(400).json({
          status: "ERR",
          message: "Chỉ có thể sửa đánh giá trong vòng 24 giờ",
        });
      }

      // Update
      existingRating.rating = rating || existingRating.rating;
      existingRating.comment = comment || existingRating.comment;
      existingRating.aspectRated = aspectRated || existingRating.aspectRated;
      if (wouldRecommend !== undefined) {
        existingRating.wouldRecommend = wouldRecommend;
      }

      await existingRating.save();
      await existingRating.populate("user", "name email picture");

      res.json({
        status: "OK",
        message: "Cập nhật đánh giá thành công",
        data: existingRating,
      });
    } catch (error) {
      res.status(500).json({
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

      const rating = await Rating.findById(ratingId);

      if (!rating) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy đánh giá",
        });
      }

      // Kiểm tra quyền
      if (rating.user.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          status: "ERR",
          message: "Bạn không có quyền xóa đánh giá này",
        });
      }

      await Rating.findByIdAndDelete(ratingId);

      res.json({
        status: "OK",
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        message: error.message,
      });
    }
  },

  // Thống kê rating của platform
  getPlatformRatingStats: async (req, res) => {
    try {
      const { aspectRated, membershipPackage, dateFrom, dateTo } = req.query;

      // Build query
      const matchQuery = {};
      if (aspectRated) matchQuery.aspectRated = aspectRated;
      if (membershipPackage) matchQuery.membershipPackage = membershipPackage;
      if (dateFrom || dateTo) {
        matchQuery.createdAt = {};
        if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo);
      }

      const stats = await Rating.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            wouldRecommendCount: {
              $sum: { $cond: ["$wouldRecommend", 1, 0] },
            },
            distribution: {
              $push: "$rating",
            },
            aspectBreakdown: {
              $push: {
                aspect: "$aspectRated",
                rating: "$rating",
              },
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.json({
          status: "OK",
          data: {
            averageRating: 0,
            totalRatings: 0,
            recommendationRate: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            aspectAverages: {},
          },
        });
      }

      // Tính phân bố rating
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      stats[0].distribution.forEach((rating) => {
        distribution[rating]++;
      });

      // Tính average rating theo aspect
      const aspectAverages = {};
      const aspectGroups = {};

      stats[0].aspectBreakdown.forEach((item) => {
        if (!aspectGroups[item.aspect]) {
          aspectGroups[item.aspect] = [];
        }
        aspectGroups[item.aspect].push(item.rating);
      });

      Object.keys(aspectGroups).forEach((aspect) => {
        const ratings = aspectGroups[aspect];
        aspectAverages[aspect] = {
          average:
            Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
            ) / 10,
          count: ratings.length,
        };
      });

      const recommendationRate = Math.round(
        (stats[0].wouldRecommendCount / stats[0].totalRatings) * 100
      );

      res.json({
        status: "OK",
        data: {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalRatings: stats[0].totalRatings,
          recommendationRate: recommendationRate + "%",
          distribution,
          aspectAverages,
        },
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

      const ratings = await Rating.find()
        .populate("user", "name email picture")
        .sort({ createdAt: -1 })
        .limit(limit * 1);

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
};

module.exports = ratingController;
