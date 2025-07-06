const SubscriptionModel = require("../models/SubscriptionsModel");
const UserModel = require("../models/UserModel");
const MembershipModel = require("../models/MembershipModel");
const mongoose = require("mongoose");

exports.validateSubscription = async (data) => {
  const { userId, membershipId, startDate, endDate, paymentId } = data;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId.");
  }
  const userExists = await UserModel.findById(userId);
  if (!userExists) {
    throw new Error("User does not exist.");
  }

  if (!membershipId || !mongoose.Types.ObjectId.isValid(membershipId)) {
    throw new Error("Invalid membershipId.");
  }
  const membershipExists = await MembershipModel.findById(membershipId);
  if (!membershipExists) {
    throw new Error("Membership does not exist.");
  }

  if (!startDate || isNaN(new Date(startDate))) {
    throw new Error("Invalid startDate.");
  }
  if (!endDate || isNaN(new Date(endDate))) {
    throw new Error("Invalid endDate.");
  }
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("startDate must be before endDate.");
  }

  if (!paymentId || !paymentId.trim()) {
    throw new Error("paymentId is required.");
  }

  const existingActiveSubscription = await SubscriptionModel.findOne({
    userId: userId,
    status: "active",
    endDate: { $gt: new Date() }
  });

  if (existingActiveSubscription) {
    throw new Error("User already has an active subscription.");
  }
};

exports.createSubscription = async (data) => {
  const membership = await MembershipModel.findById(data.membershipId);
  if (!membership) {
    throw new Error("Membership not found.");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + membership.duration);

  const newSubscription = await SubscriptionModel.create({
    userId: data.userId,
    membershipId: data.membershipId,
    startDate: startDate,
    endDate: endDate,
    status: data.status || "active",
    paymentId: data.paymentId,
  });

  return newSubscription;
};

exports.getAllSubscriptions = async () => {
  return await SubscriptionModel.find().populate("userId membershipId");
};

exports.getSubscriptionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid subscription ID.");
  }

  const subscription = await SubscriptionModel.findById(id).populate(
    "userId membershipId"
  );
  if (!subscription) {
    throw new Error("Subscription not found.");
  }
  return subscription;
};

exports.updateSubscription = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid subscription ID.");
  }

  const updated = await SubscriptionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).populate("userId membershipId");
  if (!updated) {
    throw new Error("Subscription not found.");
  }
  return updated;
};

exports.deleteSubscription = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid subscription ID.");
  }

  const deleted = await SubscriptionModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Subscription not found.");
  }
  return deleted;
};

exports.extendSubscription = async (id, newEndDate) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid subscription ID.");
  }

  const subscription = await SubscriptionModel.findById(id);
  if (!subscription) {
    throw new Error("Subscription not found.");
  }

  if (subscription.status === "cancelled") {
    throw new Error("Cannot extend a cancelled subscription.");
  }

  if (!newEndDate || isNaN(new Date(newEndDate))) {
    throw new Error("Invalid newEndDate.");
  }

  if (new Date(newEndDate) <= new Date(subscription.endDate)) {
    throw new Error("New end date must be after current end date.");
  }

  subscription.endDate = newEndDate;
  await subscription.save();

  return subscription;
};

exports.cancelSubscription = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid subscription ID.");
  }

  const subscription = await SubscriptionModel.findById(id);
  if (!subscription) {
    throw new Error("Subscription not found.");
  }

  if (subscription.status === "cancelled") {
    throw new Error("Subscription is already cancelled.");
  }

  subscription.status = "cancelled";
  await subscription.save();

  return subscription;
};

exports.getMySubscription = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId.");
  }

  const userExists = await UserModel.findById(userId);
  if (!userExists) {
    throw new Error("User does not exist.");
  }

  // Tìm subscription active hiện tại của user
  const activeSubscription = await SubscriptionModel.findOne({
    userId: userId,
    status: "active",
    endDate: { $gt: new Date() } // Chưa hết hạn
  }).populate("userId", "name email")
    .populate("membershipId", "name price duration description");

  if (!activeSubscription) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      message: "Bạn chưa có gói đăng ký nào đang hoạt động"
    };
  }

  // Tính số ngày còn lại
  const now = new Date();
  const daysRemaining = Math.ceil((activeSubscription.endDate - now) / (1000 * 60 * 60 * 24));

  return {
    hasActiveSubscription: true,
    subscription: {
      ...activeSubscription.toObject(),
      daysRemaining: daysRemaining,
      isExpiringSoon: daysRemaining <= 7, // Cảnh báo khi còn <= 7 ngày
      status: daysRemaining <= 3 ? "expiring_soon" : "active"
    },
    message: daysRemaining <= 3 ?
      `Gói đăng ký sẽ hết hạn trong ${daysRemaining} ngày` :
      `Gói đăng ký còn ${daysRemaining} ngày`
  };
};

exports.getMySubscriptionHistory = async (userId, page = 1, limit = 10) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId.");
  }

  const userExists = await UserModel.findById(userId);
  if (!userExists) {
    throw new Error("User does not exist.");
  }

  const skip = (page - 1) * limit;

  const subscriptions = await SubscriptionModel.find({
    userId: userId
  })
    .populate("membershipId", "name price duration description")
    .sort({ createdAt: -1 }) // Mới nhất trước
    .skip(skip)
    .limit(limit);

  const total = await SubscriptionModel.countDocuments({ userId: userId });

  const subscriptionsWithStatus = subscriptions.map(sub => {
    const now = new Date();
    const isExpired = sub.endDate < now;
    const daysRemaining = isExpired ? 0 : Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24));

    return {
      ...sub.toObject(),
      daysRemaining: daysRemaining,
      actualStatus: isExpired ? "expired" : sub.status,
      duration: Math.ceil((sub.endDate - sub.startDate) / (1000 * 60 * 60 * 24))
    };
  });

  return {
    subscriptions: subscriptionsWithStatus,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};