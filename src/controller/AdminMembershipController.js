const AdminMembershipStatisticsService = require("../services/AdminMembershipStatisticsService");

const getMembershipStatistics = async (req, res) => {
  try {
    const statistics =
      await AdminMembershipStatisticsService.getMembershipStatistics();

    return res.status(200).json({
      status: "OK",
      message: "Get membership statistics successfully",
      data: statistics,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

module.exports = {
  getMembershipStatistics,
};
