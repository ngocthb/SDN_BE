const MembershipModel = require("../models/MembershipModel");
const mongoose = require("mongoose");

exports.validateMembership = (data) => {
  const { name, price, duration, description } = data;

  if (!name || !name.trim()) {
    throw new Error("Membership name is required.");
  }
  if (name.trim().length < 3 || name.trim().length > 100) {
    throw new Error("Membership name must be between 3 and 100 characters.");
  }

  if (price == null || typeof price !== "number" || price < 0) {
    throw new Error("Price must be a valid positive number.");
  }

  if (duration == null || typeof duration !== "number" || duration <= 0) {
    throw new Error("Duration must be a positive number (days).");
  }

  if (description && description.length > 1000) {
    throw new Error("Description cannot exceed 1000 characters.");
  }
};

exports.createMembership = async (data) => {
  this.validateMembership(data);

  const newMembership = await MembershipModel.create({
    name: data.name.trim(),
    price: data.price,
    duration: data.duration,
    description: data.description,
  });

  return newMembership;
};

exports.getAllMemberships = async () => {
  return await MembershipModel.find();
};

exports.getMembershipById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid membership ID.");
  }

  const membership = await MembershipModel.findById(id);
  if (!membership) {
    throw new Error("Membership not found.");
  }

  return membership;
};

exports.updateMembership = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid membership ID.");
  }

  this.validateMembership(data);

  const updated = await MembershipModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updated) {
    throw new Error("Membership not found.");
  }

  return updated;
};

exports.deleteMembership = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid membership ID.");
  }

  const deleted = await MembershipModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Membership not found.");
  }

  return deleted;
};
