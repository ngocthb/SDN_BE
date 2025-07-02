const MembershipModel = require('../models/MembershipModel');

const getMemberships = async () => {
  try {
    const memberships = await MembershipModel.find({ isActive: true });
    return memberships;
  } catch (error) {
    throw error;
  }
};

const getAllMemberships = async () => {
  try {
    const memberships = await MembershipModel.find();
    return memberships;
  } catch (error) {
    throw error;
  }
};

const getMembershipById = async (id) => {
  try {
    const membership = await MembershipModel.findById(id);
    return membership;
  } catch (error) {
    throw error;
  }
};

const createMembership = async (name, price, duration, description, features, maxCoachSessions, tier, benefits, limitations) => {
  try {
    const checkMembership = await MembershipModel.findOne({ name: name });
    if (checkMembership !== null) {
      return null;
    }
    const newMembership = await MembershipModel.create({
      name,
      price,
      duration,
      description,
      features,
      maxCoachSessions,
      tier,
      benefits,
      limitations
    });
    return newMembership;
  } catch (error) {
    throw error;
  }
};

const updateMembership = async (id, data) => {
  try {
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    const updatedMembership = await MembershipModel.findByIdAndUpdate(id, data, { new: true });
    return updatedMembership;
  } catch (error) {
    throw error;
  }
};

const deleteMembership = async (id) => {
  try {
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    await MembershipModel.findByIdAndUpdate(id, { isActive: false });
    return "Delete membership success";
  } catch (error) {
    throw error;
  }
};

const restoreMembership = async (id) => {
  try {
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    await MembershipModel.findByIdAndUpdate(id, { isActive: true });
    return "Restore membership success";
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  restoreMembership,
  getAllMemberships
};
