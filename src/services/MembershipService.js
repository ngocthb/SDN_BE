const MembershipModel = require('../models/MembershipModel');

//user
const getMemberships = async () => {
  try {
    const memberships = await MembershipModel.find({ isDeleted: false });
    return memberships;
  } catch (error) {
    throw error;
  }
};

const getMembershipById = async (id) => {
  try {
    const membership = await MembershipModel.findOne({ _id: id, isDeleted: false });
    return membership;
  } catch (error) {
    throw error;
  }
};

//admin
const getAllMemberships = async () => {
  try {
    const memberships = await MembershipModel.find();
    return memberships;
  } catch (error) {
    throw error;
  }
};

const getMembershipByIdAdmin = async (id) => {
  try {
    const membership = await MembershipModel.findById(id);
    return membership;
  } catch (error) {
    throw error;
  }
};

const createMembership = async (name, price, duration, description) => {
  try {
    const checkMembership = await MembershipModel.findOne({ name: name });
    if (checkMembership !== null) {
      return null;
    }
    const newMembership = await MembershipModel.create({
      name,
      price,
      duration,
      description
    });
    return newMembership;
  } catch (error) {
    throw error;
  }
};

const updateMembership = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Invalid ID provided");
    }
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    const updateFields = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.price !== undefined) updateFields.price = data.price;
    if (data.duration !== undefined) updateFields.duration = data.duration;
    if (data.description !== undefined) updateFields.description = data.description;
    const updatedMembership = await MembershipModel.findByIdAndUpdate(id, updateFields, { new: true });
    return updatedMembership;
  } catch (error) {
    throw error;
  }
};

const deleteMembership = async (id) => {
  try {
    if (!id) {
      throw new Error("Invalid ID provided");
    }
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    await MembershipModel.findByIdAndUpdate(id, { isDeleted: true });
    return "Delete membership success";
  } catch (error) {
    throw error;
  }
};

const restoreMembership = async (id) => {
  try {
    if (!id) {
      throw new Error("Invalid ID provided");
    }
    const checkMembership = await MembershipModel.findOne({ _id: id });
    if (checkMembership === null) {
      return null;
    }
    await MembershipModel.findByIdAndUpdate(id, { isDeleted: false });
    return "Restore membership success";
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getMemberships,
  getMembershipById,
  getAllMemberships,
  getMembershipByIdAdmin,
  createMembership,
  updateMembership,
  deleteMembership,
  restoreMembership
};
