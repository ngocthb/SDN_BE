const MembershipModel = require('../models/MembershipModel');
const SubscriptionModel = require('../models/SubscriptionsModel');

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
    if (!name || !price || !duration) {
      throw new Error("Missing required fields: name, price, duration");
    }

    if (typeof price !== "number" || price < 1000) {
      throw new Error("Price must be a number and at least 1000");
    }
    if (typeof duration !== "number" || duration <= 0) {
      throw new Error("Duration must be a positive number");
    }
    if (description && description.length > 500) {
      throw new Error("Description must not exceed 500 characters");
    }

    const checkMembership = await MembershipModel.findOne({ name: name });
    if (checkMembership !== null) {
      throw new Error("Membership name already exists");
    }

    const newMembership = await MembershipModel.create({
      name,
      price,
      duration,
      description,
    });
    return newMembership;
  } catch (error) {
    throw error;
  }
};;

const updateMembership = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Invalid ID provided");
    }

    const activeSubscriptions = await SubscriptionModel.find({
      membershipId: id,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (activeSubscriptions.length > 0) {
      return { error: "Cannot update membership. It is currently in use by active subscriptions." };
    }

    if (data.price !== undefined && (typeof data.price !== "number" || data.price < 1000)) {
      throw new Error("Price must be a number and at least 1000");
    }
    if (data.duration !== undefined && (typeof data.duration !== "number" || data.duration <= 0)) {
      throw new Error("Duration must be a positive number");
    }
    if (data.description !== undefined && data.description.length > 500) {
      throw new Error("Description must not exceed 500 characters");
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

    const activeSubscriptions = await SubscriptionModel.find({
      membershipId: id,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (activeSubscriptions.length > 0) {
      return { error: "Cannot delete membership. It is currently in use by active subscriptions." };
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
