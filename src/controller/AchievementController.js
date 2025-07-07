const achievementService = require("../services/AchievementService");

exports.createAchievement = async (req, res) => {
  try {
    const newAchievement = await achievementService.createAchievement(req.body);
    return res.status(201).json({
      success: true,
      message: "Achievement created successfully.",
      data: newAchievement,
    });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    return res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await achievementService.getAchievementById(
      req.params.id
    );
    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    console.error("Error fetching achievement:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const updated = await achievementService.updateAchievement(
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Achievement updated successfully.",
        data: updated,
      });
  } catch (error) {
    console.error("Error updating achievement:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    await achievementService.deleteAchievement(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Achievement deleted successfully." });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await achievementService.getTopUsersByAchievements();

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
