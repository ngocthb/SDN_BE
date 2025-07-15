// services/RatingService.js - FIXED getAllRatings method
const Rating = require("../models/Rating");
const User = require("../models/UserModel");
const Subscription = require("../models/SubscriptionsModel");

const RatingService = {
  // Helper function để lấy subscription hiện tại của user
  getCurrentSubscription: async (userId) => {
    const currentDate = new Date();

    const activeSubscription = await Subscription.findOne({
      userId: userId,
      status: "active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .populate("membershipId", "name type price features")
      .sort({ endDate: -1 }); // Lấy subscription expire muộn nhất nếu có nhiều

    return activeSubscription;
  },

  // Tạo rating mới (Updated với subscription support)
  createRating: async (userId, ratingData) => {
    try {
      const { rating, comment, aspectRated, wouldRecommend } = ratingData;

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

      // Lấy subscription hiện tại của user
      const currentSubscription = await RatingService.getCurrentSubscription(
        userId
      );

      // Tạo rating mới với subscription reference
      const newRating = new Rating({
        user: userId,
        rating,
        comment: comment || "",
        aspectRated: aspectRated || "overall",
        subscription: currentSubscription?._id || null, // Reference đến subscription hoặc null cho free user
        // Giữ lại membershipPackage để backward compatibility
        membershipPackage: currentSubscription?.membershipId?.type || "free",
        daysUsed,
        wouldRecommend: wouldRecommend !== false, // default true
      });

      await newRating.save();

      // Populate user và subscription information
      await newRating.populate([
        { path: "user", select: "name email picture" },
        {
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price features",
          },
        },
      ]);

      return newRating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy ratings của user (Updated với subscription info)
  getUserRatings: async (userId, page = 1, limit = 10) => {
    try {
      const ratings = await Rating.find({ user: userId })
        .populate({
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price features",
          },
        })
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

  // Lấy rating theo ID (Updated với subscription info)
  getRatingById: async (ratingId) => {
    try {
      const rating = await Rating.findById(ratingId)
        .populate("user", "name email picture")
        .populate({
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price features",
          },
        });

      if (!rating) {
        throw new Error("Không tìm thấy đánh giá");
      }

      return rating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Cập nhật rating (Updated với subscription info)
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
      await existingRating.populate([
        { path: "user", select: "name email picture" },
        {
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price features",
          },
        },
      ]);

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

  // Kiểm tra user có thể rating không + thông tin subscription
  canUserRate: async (userId) => {
    try {
      const hasRecent = await Rating.hasRecentRating(userId);
      const currentSubscription = await RatingService.getCurrentSubscription(
        userId
      );

      return {
        canRate: !hasRecent,
        hasRecentRating: hasRecent,
        currentSubscription: currentSubscription
          ? {
              id: currentSubscription._id,
              status: currentSubscription.status,
              startDate: currentSubscription.startDate,
              endDate: currentSubscription.endDate,
              membershipId: currentSubscription.membershipId,
            }
          : null,
        membershipType: currentSubscription?.membershipId?.type || "free",
        membershipName: currentSubscription?.membershipId?.name || "Free",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy rating gần nhất của user (Updated với subscription info)
  getUserLatestRating: async (userId) => {
    try {
      const rating = await Rating.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .populate("user", "name email picture")
        .populate({
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price features",
          },
        });

      return rating;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Enhanced getPlatformStats với real membership names
  getPlatformStats: async (filters = {}) => {
    try {
      const {
        aspectRated,
        membershipType,
        membershipPackage,
        dateFrom,
        dateTo,
      } = filters;

      // Build aggregation pipeline
      const pipeline = [];

      // Stage 1: Lookup subscription và membership info
      pipeline.push(
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
        }
      );

      // Stage 2: Add computed fields with ENHANCED LOGIC
      pipeline.push({
        $addFields: {
          // Enhanced membership classification
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
                  { $arrayElemAt: ["$membershipInfo.name", 0] }, // Use real membership name
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
          // Keep original membershipType for filtering
          membershipType: {
            $ifNull: [
              { $arrayElemAt: ["$membershipInfo.type", 0] },
              { $ifNull: ["$membershipPackage", "free"] },
            ],
          },
        },
      });

      // Stage 3: Match query
      const matchQuery = {};
      if (aspectRated) matchQuery.aspectRated = aspectRated;
      if (membershipType) matchQuery.membershipType = membershipType;
      if (membershipPackage) matchQuery.membershipPackage = membershipPackage;
      if (dateFrom || dateTo) {
        matchQuery.createdAt = {};
        if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo);
      }

      if (Object.keys(matchQuery).length > 0) {
        pipeline.push({ $match: matchQuery });
      }

      // Stage 4: Group và tính toán
      pipeline.push({
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
          membershipBreakdown: {
            $push: {
              membershipCategory: "$membershipCategory", // Use real names for display
              membershipType: "$membershipType", // Keep for compatibility
              rating: "$rating",
            },
          },
        },
      });

      const stats = await Rating.aggregate(pipeline);

      if (stats.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          recommendationRate: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          aspectAverages: {},
          membershipAverages: {},
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

      // ENHANCED: Tính average rating theo membership category (real names)
      const membershipAverages = {};
      const membershipGroups = {};

      stats[0].membershipBreakdown.forEach((item) => {
        const key = item.membershipCategory; // Use real names instead of types
        if (!membershipGroups[key]) {
          membershipGroups[key] = [];
        }
        membershipGroups[key].push(item.rating);
      });

      Object.keys(membershipGroups).forEach((membershipName) => {
        const ratings = membershipGroups[membershipName];
        membershipAverages[membershipName] = {
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
        membershipAverages, // Now contains real names: {"Gói 1 năm": {...}, "Free Users": {...}}
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Lấy ratings gần đây (cho admin) (Updated với subscription info)
  getRecentRatings: async (limit = 10) => {
    try {
      const ratings = await Rating.find()
        .populate("user", "name email picture")
        .populate({
          path: "subscription",
          populate: {
            path: "membershipId",
            select: "name type price",
          },
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1);

      return ratings;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // ENHANCED getStatsByMembership with real membership names
  getStatsByMembership: async () => {
    try {
      const stats = await Rating.aggregate([
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
            membershipType: {
              $ifNull: [
                { $arrayElemAt: ["$membershipInfo.type", 0] },
                { $ifNull: ["$membershipPackage", "free"] },
              ],
            },
            membershipName: {
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
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$membershipPackage", "free"] },
                        then: "Free Users",
                      },
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
                    default: "Free Users",
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              type: "$membershipType",
              name: "$membershipName",
            },
            avgRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            wouldRecommendCount: {
              $sum: { $cond: ["$wouldRecommend", 1, 0] },
            },
          },
        },
        {
          $project: {
            membershipType: "$_id.type",
            membershipName: "$_id.name",
            avgRating: { $round: ["$avgRating", 2] },
            totalRatings: 1,
            wouldRecommendCount: 1,
            recommendationRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$wouldRecommendCount", "$totalRatings"] },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $sort: { avgRating: -1 },
        },
      ]);

      return stats;
    } catch (error) {
      throw new Error(`Error getting stats by membership: ${error.message}`);
    }
  },

  // COMPLETELY REWRITTEN: Lấy tất cả ratings với filters và pagination
  getAllRatings: async (filters = {}, page = 1, limit = 10) => {
    try {
      const {
        aspectRated,
        rating,
        membershipPackage,
        membershipType,
        dateFrom,
        dateTo,
        search,
      } = filters;

      // Build aggregation pipeline
      let pipeline = [];

      // Stage 1: Lookup subscription và membership info
      pipeline.push(
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
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userInfo",
          },
        }
      );

      // Stage 2: Add computed fields
      pipeline.push({
        $addFields: {
          computedMembershipType: {
            $ifNull: [
              { $arrayElemAt: ["$membershipInfo.type", 0] },
              { $ifNull: ["$membershipPackage", "free"] },
            ],
          },
          computedMembershipName: {
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
      });

      // Stage 3: Build match conditions - SIMPLIFIED APPROACH
      const matchConditions = {};

      // Basic field filters - these work directly on the original document
      if (aspectRated) matchConditions.aspectRated = aspectRated;
      if (rating) matchConditions.rating = rating;
      if (membershipPackage)
        matchConditions.membershipPackage = membershipPackage;

      // Date filters
      if (dateFrom || dateTo) {
        matchConditions.createdAt = {};
        if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchConditions.createdAt.$lte = new Date(dateTo);
      }

      // Search condition (after lookup)
      if (search) {
        matchConditions.$or = [
          { "userInfo.name": { $regex: search, $options: "i" } },
          { comment: { $regex: search, $options: "i" } },
        ];
      }

      // Apply basic match conditions first
      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // SEPARATE MEMBERSHIP TYPE FILTERING - handle after addFields
      if (membershipType) {
        pipeline.push({
          $match: {
            computedMembershipName: membershipType,
          },
        });
      }

      // Get total count before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Rating.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Add pagination and sorting
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );

      // Execute final aggregation
      const ratings = await Rating.aggregate(pipeline);

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
