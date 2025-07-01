const membershipService = require("../services/MembershipService");

exports.createMembership = async (req, res) => {
  try {
    const data = req.body;

    const newMembership = await membershipService.createMembership(data);

    return res.status(201).json({
      success: true,
      message: "Membership created successfully.",
      data: newMembership,
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await membershipService.getAllMemberships();

    return res.status(200).json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await membershipService.getMembershipById(id);

    return res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await membershipService.updateMembership(id, data);

    return res.status(200).json({
      success: true,
      message: "Membership updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    await membershipService.deleteMembership(id);

    return res.status(200).json({
      success: true,
      message: "Membership deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
