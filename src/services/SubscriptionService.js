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
};

exports.createSubscription = async (data) => {
  const newSubscription = await SubscriptionModel.create({
    userId: data.userId,
    membershipId: data.membershipId,
    startDate: data.startDate,
    endDate: data.endDate,
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
