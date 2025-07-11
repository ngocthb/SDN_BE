const MembershipServices = require("../services/MembershipService");

// User: chỉ lấy các gói chưa xóa
const getMemberships = async (req, res) => {
  try {
    const response = await MembershipServices.getMemberships();
    if (!response) {
      return res.status(404).json({ status: "ERR", message: "No memberships found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// User: chỉ lấy gói chưa xóa
const getMembershipById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.getMembershipById(id);
    if (!response) {
      return res.status(404).json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Admin: lấy tất cả các gói (kể cả đã xóa mềm)
const getAllMemberships = async (req, res) => {
  try {
    const response = await MembershipServices.getAllMemberships();
    if (!response) {
      return res.status(404).json({ status: "ERR", message: "No memberships found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Admin: lấy gói bất kỳ (kể cả đã xóa mềm)
const getMembershipByIdAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.getMembershipByIdAdmin(id);
    if (!response) {
      return res.status(404).json({ status: "ERR", message: "Membership not found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const createMembership = async (req, res) => {
  const { name, price, duration, description } = req.body;
  try {
    const response = await MembershipServices.createMembership(name, price, duration, description);
    if (!response) {
      return res.status(400).json({ status: "ERR", message: "Failed to create membership" });
    }
    return res.status(200).json({ status: "OK", message: "Membership created successfully", data: response });
  } catch (error) {
    return res.status(400).json({ status: "ERR", message: error.message });
  }
};

const updateMembership = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const response = await MembershipServices.updateMembership(id, updateData);
    if (response?.error) {
      return res.status(400).json({ status: "ERR", message: response.error });
    }
    return res.status(200).json({ status: "OK", message: "Membership updated successfully", data: response });
  } catch (error) {
    return res.status(400).json({ status: "ERR", message: error.message });
  }
};

const deleteMembership = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await MembershipServices.deleteMembership(id);
    if (response?.error) {
      return res.status(400).json({ status: "ERR", message: response.error });
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
  getMembershipByIdAdmin,
  createMembership,
  updateMembership,
  deleteMembership,
  restoreMembership,
};
