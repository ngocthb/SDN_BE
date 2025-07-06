const vnpay = require("../config/vnPayConfig");
const { ProductCode, VnpLocale, dateFormat } = require("vnpay");
const SubscriptionModel = require("../models/SubscriptionsModel");
const MembershipModel = require("../models/MembershipModel");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");

exports.createOrderAndBuildPaymentUrl = async (data, ipAddress) => {
  const { userId, membershipId } = data;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId.");
  }
  if (!mongoose.Types.ObjectId.isValid(membershipId)) {
    throw new Error("Invalid membershipId.");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const membership = await MembershipModel.findById(membershipId);
  if (!membership) {
    throw new Error("Membership not found.");
  }

  const orderId = `${uuidv4()}_${membershipId}_${userId}`;

  const amount = membership.price;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddress,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan membership ${membershipId}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:3000/vnpay-return", //Fe change
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(tomorrow),
  });

  return {
    orderId,
    amount,
    paymentUrl,
  };
};

exports.confirmPayment = async (data) => {
  const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo } = data;

  if (vnp_ResponseCode !== "00") {
    throw new Error("Payment failed or cancelled.");
  }

  const parts = vnp_TxnRef.split("_");
  if (parts.length < 3) {
    throw new Error("Invalid transaction reference.");
  }

  const membershipId = parts[1];
  const userId = parts[2];

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(membershipId)
  ) {
    throw new Error("Invalid userId or membershipId.");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const membership = await MembershipModel.findById(membershipId);
  if (!membership) {
    throw new Error("Membership not found.");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + membership.duration);

  console.log("MembershipId:", membershipId);
  console.log("UserId:", userId);
  console.log("Is valid membershipId:", mongoose.Types.ObjectId.isValid(membershipId));
  console.log("Is valid userId:", mongoose.Types.ObjectId.isValid(userId));

  const newSubscription = await SubscriptionModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    membershipId: new mongoose.Types.ObjectId(membershipId),
    startDate,
    endDate,
    status: "active",
    paymentId: vnp_TxnRef,
  });

  return newSubscription;
};
