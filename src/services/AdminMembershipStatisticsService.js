const MembershipModel = require("../models/MembershipModel");
const SubscriptionModel = require("../models/SubscriptionsModel");
const UserModel = require("../models/UserModel");

const getMembershipStatistics = async () => {
  try {
    // Membership Plans Statistics
    const totalPlans = await MembershipModel.countDocuments();
    const activePlans = await MembershipModel.countDocuments({
      isDeleted: false,
    });
    const deletedPlans = await MembershipModel.countDocuments({
      isDeleted: true,
    });

    // Subscription Statistics
    const totalSubscriptions = await SubscriptionModel.countDocuments();
    const activeSubscriptions = await SubscriptionModel.countDocuments({
      status: "active",
      endDate: { $gt: new Date() },
    });
    const expiredSubscriptions = await SubscriptionModel.countDocuments({
      status: "expired",
    });
    const cancelledSubscriptions = await SubscriptionModel.countDocuments({
      status: "cancelled",
    });

    // Users with active subscriptions
    const usersWithActiveSubscriptions = await SubscriptionModel.distinct(
      "userId",
      {
        status: "active",
        endDate: { $gt: new Date() },
      }
    );

    // Revenue Calculation (based on membership prices)
    const revenueData = await SubscriptionModel.aggregate([
      {
        $lookup: {
          from: "memberships",
          localField: "membershipId",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $unwind: "$membership",
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$membership.price" },
          averageRevenue: { $avg: "$membership.price" },
        },
      },
    ]);

    // Popular Membership Plans
    const popularPlans = await SubscriptionModel.aggregate([
      {
        $group: {
          _id: "$membershipId",
          subscriptionCount: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "active"] },
                    { $gt: ["$endDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "memberships",
          localField: "_id",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $unwind: "$membership",
      },
      {
        $project: {
          name: "$membership.name",
          price: "$membership.price",
          subscriptionCount: 1,
          activeCount: 1,
          revenue: { $multiply: ["$subscriptionCount", "$membership.price"] },
        },
      },
      {
        $sort: { subscriptionCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Subscription Trends (last 7 days)
    const subscriptionTrends = await SubscriptionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue Trends (last 30 days)
    const revenueTrends = await SubscriptionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $lookup: {
          from: "memberships",
          localField: "membershipId",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $unwind: "$membership",
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$membership.price" },
          subscriptionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Price Range Analysis
    const priceRanges = await MembershipModel.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$price", 100000] }, then: "Under 100K" },
                { case: { $lt: ["$price", 500000] }, then: "100K - 500K" },
                { case: { $lt: ["$price", 1000000] }, then: "500K - 1M" },
                { case: { $gte: ["$price", 1000000] }, then: "Over 1M" },
              ],
              default: "Other",
            },
          },
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
        },
      },
    ]);

    // Duration Analysis
    const durationAnalysis = await MembershipModel.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$duration", 30] }, then: "1 Month" },
                { case: { $lte: ["$duration", 90] }, then: "3 Months" },
                { case: { $lte: ["$duration", 180] }, then: "6 Months" },
                { case: { $lte: ["$duration", 365] }, then: "1 Year" },
                { case: { $gt: ["$duration", 365] }, then: "Over 1 Year" },
              ],
              default: "Other",
            },
          },
          count: { $sum: 1 },
          averageDuration: { $avg: "$duration" },
        },
      },
    ]);

    return {
      overview: {
        totalPlans,
        activePlans,
        deletedPlans,
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        subscribedUsers: usersWithActiveSubscriptions.length,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageRevenue: revenueData[0]?.averageRevenue || 0,
      },
      popularPlans,
      subscriptionTrends,
      revenueTrends,
      priceRanges,
      durationAnalysis,
      statusDistribution: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        cancelled: cancelledSubscriptions,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getMembershipStatistics,
};
