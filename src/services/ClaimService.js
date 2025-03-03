const ClaimModel = require("../models/ClaimModel");
const UserModel = require("../models/UserModel");
const StatusModel = require("../models/StatusModel");
const ProjectModel = require("../models/ProjectModel");
const ExcelJS = require("exceljs");
const moment = require("moment");

const createClaim = async (id, newClaim) => {
  try {
    const user = await UserModel.findById(id).populate("role_id", "name -_id");
    if (!user) {
      throw new Error("User not found");
    }

    const project = await ProjectModel.findById(newClaim.project_id);
    if (!project) {
      throw new Error("Project not found");
    }

    let status;
    if (newClaim.status === "Pending" || newClaim.status === "Draft") {
      status = await StatusModel.findOne({ name: newClaim.status });
      if (!status) {
        throw new Error("Status not found");
      }
    } else if (newClaim.status) {
      throw new Error("You are not allowed to update this status");
    }

    const createdClaim = await ClaimModel.create({
      user_id: id,
      date: newClaim.date,
      from: newClaim.from,
      project_id: newClaim.project_id,
      to: newClaim.to,
      total_no_of_hours: newClaim.total_no_of_hours,
      attached_file: newClaim.attached_file,
      reason_claimer: newClaim.reason_claimer,
      status_id: status._id,
    });

    const dataOutput = {
      user,
      project,
      ...createdClaim._doc,
    };

    delete dataOutput.user_id;
    delete dataOutput.project_id;

    return {
      status: "OK",
      message: "Success create claim",
      data: dataOutput,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: error.message,
    };
  }
};

const getClaim = (role, userId, filters, page, limit, sortBy, sortOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      const loginUser = await UserModel.findById(userId);

      const listClaims = await ClaimModel.find()
        .populate("status_id", "name -_id")
        .populate("user_id");

      let listClaimsData = await Promise.all(
        listClaims.map(async (claim) => {
          const user = await UserModel.findById(claim.user_id._id).populate(
            "role_id",
            "name -_id"
          );

          const project = await ProjectModel.findById(claim.project_id);
          if (!project) {
            throw new Error("Project not found");
          }
          return {
            project_name: project.project_name,
            user_name: user.user_name,
            email: user.email,
            project_duration: project.duration,
            _id: claim._id,
            date: claim.date,
            from: claim.from,
            to: claim.to,
            total_no_of_hours: claim.total_no_of_hours,
            attached_file: claim.attached_file,
            reason_claimer: claim.reason_claimer,
            status: claim.status_id.name,
            createdAt: claim.createdAt,
            updatedAt: claim.updatedAt,
          };
        })
      );

      if (role === "Claimer") {
        listClaimsData = listClaimsData.filter(
          (claim) => claim.email === loginUser.email
        );
      }

      if (role === "Approver") {
        listClaimsData = listClaimsData.filter(
          (claim) =>
            claim.status === "Pending" ||
            claim.status === "Approved" ||
            claim.status === "Paid"
        );
      }

      if (role === "Finance") {
        listClaimsData = listClaimsData.filter(
          (claim) => claim.status === "Approved" || claim.status === "Paid"
        );
      }

      if (filters.status && filters.status !== "all") {
        listClaimsData = listClaimsData.filter(
          (claim) => claim.status === filters.status
        );
      }

      if (filters.staffName) {
        listClaimsData = listClaimsData.filter((claim) =>
          claim.user_name
            .toLowerCase()
            .includes(filters.staffName.toLowerCase())
        );
      }

      if (filters.projectName) {
        listClaimsData = listClaimsData.filter((claim) =>
          claim.project_name
            ?.toLowerCase()
            .includes(filters.projectName.toLowerCase())
        );
      }

      if (filters.fromDate) {
        listClaimsData = listClaimsData.filter(
          (claim) =>
            new Date(claim.project_duration.from) >= new Date(filters.fromDate)
        );
      }

      if (filters.toDate) {
        listClaimsData = listClaimsData.filter(
          (claim) =>
            new Date(claim.project_duration.to) <= new Date(filters.toDate)
        );
      }
      if (filters.totalWorkingHours) {
        listClaimsData = listClaimsData.filter(
          (claim) => claim.total_no_of_hours == filters.totalWorkingHours
        );
      }

      if (sortBy) {
        const sortField = sortBy;
        const sortDirection = sortOrder === "desc" ? -1 : 1;
        listClaimsData = listClaimsData.sort((a, b) => {
          if (a[sortField] < b[sortField]) return -1 * sortDirection;
          if (a[sortField] > b[sortField]) return 1 * sortDirection;
          return 0;
        });
      }

      const totalClaim = listClaimsData.length;
      if (limit && page) {
        listClaimsData = listClaimsData.slice((page - 1) * limit, page * limit);
      }

      const dataOutput = {
        claims: listClaimsData,
        total: {
          currentPage: page || 1,
          totalClaim: totalClaim,
          totalPage: Math.ceil(totalClaim / limit) || 1,
          totalAllClaim: listClaims.length,
        },
      };

      resolve({
        status: "OK",
        message: "Successfully retrieved claims",
        data: dataOutput,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateClaimForClaimer = async (userId, claimId, updateClaim) => {
  try {
    const claim = await ClaimModel.findById(claimId).populate("status_id");
    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.user_id.toString() !== userId) {
      throw new Error("You are not authorized to update this claim");
    }

    if (
      claim.status_id.name !== "Draft" &&
      claim.status_id.name !== "Pending"
    ) {
      throw new Error("Claim status must be 'Draft' or 'Pending' to update");
    }

    let newStatus;
    if (updateClaim.status) {
      newStatus = await StatusModel.findOne({ name: updateClaim.status });
      if (!newStatus) {
        throw new Error("Status not found");
      } else if (
        updateClaim?.status !== "Pending" &&
        updateClaim?.status !== "Cancelled"
      ) {
        throw new Error("You are not allowed to update this status");
      }
    }

    const updateClaimData = {
      date: updateClaim.date || claim.date,
      from: updateClaim.from || claim.from,
      to: updateClaim.to || claim.to,
      total_no_of_hours:
        updateClaim.total_no_of_hours || claim.total_no_of_hours,
      attached_file: updateClaim.attached_file || claim.attached_file,
      reason_claimer: updateClaim.reason_claimer || claim.reason_claimer,
      status_id: newStatus?._id || claim.status_id,
    };

    const updatedClaim = await ClaimModel.findByIdAndUpdate(
      claimId,
      updateClaimData,
      { new: true }
    );

    const user = await UserModel.findById(updatedClaim.user_id).populate(
      "role_id",
      "name -_id"
    );

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ProjectModel.findById(updatedClaim.project_id);

    if (!project) {
      throw new Error("Project not found");
    }

    const status = await StatusModel.findById(updatedClaim.status_id);

    const dataOutput = {
      user,
      project,
      status,
      ...updatedClaim._doc,
    };

    delete dataOutput.user_id;
    delete dataOutput.project_id;
    delete dataOutput.status_id;

    if (updatedClaim) {
      return {
        status: "OK",
        message: "Successfully updated claim",
        data: dataOutput,
      };
    }
  } catch (error) {
    return {
      status: "ERR",
      message: error.message,
    };
  }
};

const updateClaimForOtherRole = async (role, claimId, updateClaim) => {
  try {
    const claim = await ClaimModel.findById(claimId).populate("status_id");
    if (!claim) {
      throw new Error("Claim not found");
    }

    if (
      claim.status_id.name === "Cancelled" ||
      claim.status_id.name === "Draft"
    ) {
      throw new Error("Claim status not be able to update");
    }

    let newStatus;
    if (updateClaim.status) {
      newStatus = await StatusModel.findOne({ name: updateClaim.status });
      if (!newStatus) {
        throw new Error("Status not found");
      } else if (
        claim.status_id.name === "Pending" &&
        updateClaim?.status !== "Approved" &&
        updateClaim?.status !== "Rejected" &&
        role === "Approver"
      ) {
        throw new Error("You are not allowed to update status");
      } else if (
        claim.status_id.name === "Approved" &&
        updateClaim?.status !== "Paid" &&
        role === "Finance"
      ) {
        throw new Error("You are not allowed to update status");
      }
    }

    let updateClaimData = {
      reason_approver: updateClaim.reason_approver || claim.reason_approver,
      status_id: newStatus?._id || claim.status_id,
    };

    if (role !== "Approver") {
      updateClaim.reason_approver = claim.reason_approver;
    }

    const updatedClaim = await ClaimModel.findByIdAndUpdate(
      claimId,
      updateClaimData,
      { new: true }
    );

    const user = await UserModel.findById(updatedClaim.user_id).populate(
      "role_id",
      "name -_id"
    );

    if (!user) {
      throw new Error("User not found");
    }

    const project = await ProjectModel.findById(updatedClaim.project_id);

    if (!project) {
      throw new Error("Project not found");
    }

    const status = await StatusModel.findById(updatedClaim.status_id);

    const dataOutput = {
      user,
      project,
      status,
      ...updatedClaim._doc,
    };

    delete dataOutput.user_id;
    delete dataOutput.project_id;
    delete dataOutput.status_id;

    if (updatedClaim) {
      return {
        status: "OK",
        message: "Successfully updated claim",
        data: dataOutput,
      };
    }
  } catch (error) {
    return {
      status: "ERR",
      message: error.message,
    };
  }
};

const getClaimById = async (role, userID, claimId) => {
  try {
    const claim = await ClaimModel.findById(claimId);
    if (!claim) {
      throw new Error("Claim not found");
    }
    if (role === "Claimer" && claim.user_id.toString() !== userID) {
      throw new Error("You are not authorized to access this claim");
    }
    const user = await UserModel.findById(claim.user_id).populate(
      "role_id",
      "name -_id"
    );

    const project = await ProjectModel.findById(claim.project_id);

    const status = await StatusModel.findById(claim.status_id);

    const dataOutput = {
      user,
      project,
      status,
      ...claim._doc,
    };

    delete dataOutput.user_id;
    delete dataOutput.project_id;
    delete dataOutput.status_id;

    return {
      status: "OK",
      message: "Successfully get claim",
      data: dataOutput,
    };
  } catch (error) {
    return {
      status: "ERR",
      message: error.message,
    };
  }
};

const getPaidClaimsForCurrentMonth = async (month, year) => {
  try {
    const startOfMonth = moment({ year, month: month - 1 })
      .startOf("month")
      .toDate();
    const endOfMonth = moment({ year, month: month - 1 })
      .endOf("month")
      .toDate();

    let claims = await ClaimModel.find({
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("user_id")
      .populate("project_id")
      .populate("status_id");

    claims = claims.filter((claim) => claim.status_id.name === "Paid");
    return claims;
  } catch (error) {
    throw new Error("Error fetching claims: " + error.message);
  }
};

const generatePaidClaimsExcel = async (claims) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Paid Claims");

  worksheet.columns = [
    { header: "Claim ID", key: "_id", width: 25 },
    { header: "User Name", key: "userName", width: 20 },
    { header: "Project Name", key: "projectName", width: 20 },
    { header: "Total Hours", key: "totalHours", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Payment Date", key: "paymentDate", width: 20 },
    { header: "Reason Claimer", key: "reasonClaimer", width: 30 },
    { header: "Reason Approver", key: "reasonApprover", width: 30 },
    { header: "Attachment", key: "attachedFile", width: 30 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  headerRow.eachCell((cell) => {
    cell.border = {
      bottom: { style: "thin", color: { argb: "000000" } },
    };
  });

  claims.forEach((claim) => {
    worksheet.addRow({
      _id: claim._id.toString(),
      userName: claim.user_id?.user_name || "Unknown",
      projectName: claim.project_id?.project_name || "No Project",
      totalHours: claim.total_no_of_hours || 0,
      status: claim.status_id?.name || "Unknown",
      paymentDate: moment(claim.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      reasonClaimer: claim.reason_claimer || "No reason",
      reasonApprover: claim.reason_approver || "No response",
      attachedFile: claim.attached_file || "No file",
    });
  });

  return workbook;
};

module.exports = {
  createClaim,
  getClaim,
  updateClaimForClaimer,
  updateClaimForOtherRole,
  getClaimById,
  getPaidClaimsForCurrentMonth,
  generatePaidClaimsExcel,
};
