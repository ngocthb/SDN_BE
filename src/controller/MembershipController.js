const MembershipServices = require("../services/MembershipService");

const getMemberships = async (req, res) => {
  try {
    const response = await MembershipServices.getMemberships();
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "No memberships found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getAllMemberships = async (req, res) => {
  try {
    const response = await MembershipServices.getAllMemberships();
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "No memberships found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getMembershipById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.getMembershipById(id);
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const createMembership = async (req, res) => {
  const { name, price, duration, description, features, maxCoachSessions, tier, benefits, limitations } = req.body;
  try {
    const response = await MembershipServices.createMembership(
      name,
      price,
      duration,
      description,
      features,
      maxCoachSessions,
      tier,
      benefits,
      limitations
    );
    if (!response) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Failed to create membership" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const updateMembership = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const response = await MembershipServices.updateMembership(id, updateData);
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const deleteMembership = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.deleteMembership(id);
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", message: "Membership deleted successfully" });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const restoreMembership = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.restoreMembership(id);
    if (!response) {
      return res
        .status(404)
        .json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", message: "Membership restored successfully" });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getMemberships,
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  restoreMembership,
};
