const claimServices = require("../services/ClaimService");
const UserModel = require("../models/UserModel");

const checkRole = async (userID) => {
  try {
    const user = await UserModel.findById(userID).populate(
      "role_id",
      "name -_id"
    );
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    return { status: "OK", role: user.role_id.name, id: user._id };
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const createClaim = async (req, res) => {
  try {
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    } else if (role.role !== "Claimer") {
      return res
        .status(200)
        .json({ status: "ERR", message: "You are not allowed to access" });
    }

    const { date, from, to, total_no_of_hours, project_id } = req.body;

    if (!date || !from || !to || !total_no_of_hours || !project_id) {
      return res
        .status(200)
        .json({ status: "ERR", message: "All fields are required" });
    }
    const response = await claimServices.createClaim(role.id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getClaim = async (req, res) => {
  try {
    const {
      type,
      page,
      limit,
      sortBy,
      sortOrder,
      staffName,
      projectName,
      fromDate,
      toDate,
      totalWorkingHours,
    } = req.query;
    const userId = req.user.id;
    const role = await checkRole(userId);

    if (role.status === "ERR") {
      return res.status(403).json({ status: "ERR", message: role.message });
    }

    const filters = {
      status: type || "all",
      staffName,
      projectName,
      fromDate,
      toDate,
      totalWorkingHours,
    };

    const listClaims = await claimServices.getClaim(
      role.role,
      userId,
      filters,
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder
    );

    return res.status(200).json(listClaims);
  } catch (error) {
    return res.status(500).json({ status: "ERR", message: error.message });
  }
};

const updateClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    }
    if (role.role === "Claimer") {
      const response = await claimServices.updateClaimForClaimer(
        userID,
        claimId,
        req.body
      );
      return res.status(200).json(response);
    } else {
      const response = await claimServices.updateClaimForOtherRole(
        role.role,
        claimId,
        req.body
      );
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const claimId = req.params.id;
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    }
    const response = await claimServices.getClaimById(
      role.role,
      userID,
      claimId
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const downloadPaidClaims = async (req, res) => {
  try {
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    }
    if (role.role !== "Finance" && role.role !== "Administrator") {
      return res
        .status(403)
        .json({ status: "ERR", message: "You are not allowed to access" });
    }

    const { month, year } = req.query;
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: "Month and year are invalid" });
    }

    const claims = await claimServices.getPaidClaimsForCurrentMonth(
      month,
      year
    );

    if (!claims.length) {
      return res
        .status(404)
        .json({ message: "No paid claims found this month" });
    }

    const workbook = await claimServices.generatePaidClaimsExcel(claims);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Paid_Claims.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error generating file: " + error.message });
  }
};

module.exports = {
  createClaim,
  getClaim,
  updateClaim,
  getClaimById,
  downloadPaidClaims,
};
