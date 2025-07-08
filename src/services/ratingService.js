// services/RatingService.js
const Rating = require("../models/Rating");
const User = require("../models/UserModel");

const RatingService = {
  // Tạo rating mới
  createRating: async (userId, ratingData) => {
    try {
      const {
        rating,
        comment,
        aspectRated,
        membershipPackage,
        wouldRecommend,
      } = ratingData;

      // Check xem user đã rating trong vòng 30 ngày chưa
      const hasRecent = await Rating.hasRecentRating(userId);
      if (hasRecent) {
        throw new Error(
          "Bạn đã đánh giá trong vòng 30 ngày qua. Vui lòng thử lại sau."
        );
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating phải từ 1 đến 5 sao");
      }

      // Lấy thông tin user để tính số ngày sử dụng
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User không tồn tại");
      }

      const daysUsed = Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      );

      // Tạo rating mới
      const newRating = new Rating({
        user: userId,
        rating,
        comment: comment || "",
        aspectRated: aspectRated || "overall",
        membershipPackage,
        daysUsed,
        wouldRecommend: wouldRecommend !== false, // default true
      });

      await newRating.save();
      await newRating.populate("user", "name email picture");

      return newRating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy ratings của user
  getUserRatings: async (userId, page = 1, limit = 10) => {
    try {
      const ratings = await Rating.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Rating.countDocuments({ user: userId });

      return {
        ratings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy rating theo ID
  getRatingById: async (ratingId) => {
    try {
      const rating = await Rating.findById(ratingId).populate(
        "user",
        "name email picture"
      );

      if (!rating) {
        throw new Error("Không tìm thấy đánh giá");
      }

      return rating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Cập nhật rating
  updateRating: async (ratingId, userId, updateData) => {
    try {
      const { rating, comment, aspectRated, wouldRecommend } = updateData;

      const existingRating = await Rating.findById(ratingId);

      if (!existingRating) {
        throw new Error("Không tìm thấy đánh giá");
      }

      // Kiểm tra quyền
      if (existingRating.user.toString() !== userId) {
        throw new Error("Bạn không có quyền sửa đánh giá này");
      }

      // Chỉ cho phép sửa trong vòng 24h
      const hoursSinceCreated =
        (new Date() - existingRating.createdAt) / (1000 * 60 * 60);
      if (hoursSinceCreated > 24) {
        throw new Error("Chỉ có thể sửa đánh giá trong vòng 24 giờ");
      }

      // Validate rating nếu có
      if (rating && (rating < 1 || rating > 5)) {
        throw new Error("Rating phải từ 1 đến 5 sao");
      }

      // Update fields
      if (rating) existingRating.rating = rating;
      if (comment !== undefined) existingRating.comment = comment;
      if (aspectRated) existingRating.aspectRated = aspectRated;
      if (wouldRecommend !== undefined)
        existingRating.wouldRecommend = wouldRecommend;

      await existingRating.save();
      await existingRating.populate("user", "name email picture");

      return existingRating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Xóa rating
  deleteRating: async (ratingId, userId, isAdmin = false) => {
    try {
      const rating = await Rating.findById(ratingId);

      if (!rating) {
        throw new Error("Không tìm thấy đánh giá");
      }

      // Kiểm tra quyền
      if (rating.user.toString() !== userId && !isAdmin) {
        throw new Error("Bạn không có quyền xóa đánh giá này");
      }

      await Rating.findByIdAndDelete(ratingId);
      return { message: "Xóa đánh giá thành công" };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Kiểm tra user có thể rating không
  canUserRate: async (userId) => {
    try {
      const hasRecent = await Rating.hasRecentRating(userId);
      return !hasRecent;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy rating gần nhất của user
  getUserLatestRating: async (userId) => {
    try {
      const rating = await Rating.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .populate("user", "name email picture");

      return rating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Thống kê platform rating
  getPlatformStats: async (filters = {}) => {
    try {
      const { aspectRated, membershipPackage, dateFrom, dateTo } = filters;

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
            distribution: { $push: "$rating" },
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
        return {
          averageRating: 0,
          totalRatings: 0,
          recommendationRate: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          aspectAverages: {},
        };
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

      return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalRatings: stats[0].totalRatings,
        recommendationRate: recommendationRate + "%",
        distribution,
        aspectAverages,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy ratings gần đây (cho admin)
  getRecentRatings: async (limit = 10) => {
    try {
      const ratings = await Rating.find()
        .populate("user", "name email picture")
        .sort({ createdAt: -1 })
        .limit(limit * 1);

      return ratings;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy tất cả ratings với filters và pagination
  getAllRatings: async (filters = {}, page = 1, limit = 10) => {
    try {
      const {
        aspectRated,
        rating,
        membershipPackage,
        dateFrom,
        dateTo,
        search,
      } = filters;

      // Build query
      const query = {};
      if (aspectRated) query.aspectRated = aspectRated;
      if (rating) query.rating = rating;
      if (membershipPackage) query.membershipPackage = membershipPackage;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      let pipeline = [{ $match: query }];

      // Add user lookup for search
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      });

      // Search by user name or comment
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "userInfo.name": { $regex: search, $options: "i" } },
              { comment: { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      // Sort and paginate
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );

      const ratings = await Rating.aggregate(pipeline);

      // Get total count
      let countPipeline = [{ $match: query }];
      if (search) {
        countPipeline.push(
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          {
            $match: {
              $or: [
                { "userInfo.name": { $regex: search, $options: "i" } },
                { comment: { $regex: search, $options: "i" } },
              ],
            },
          }
        );
      }
      countPipeline.push({ $count: "total" });

      const countResult = await Rating.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      return {
        ratings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = RatingService;
