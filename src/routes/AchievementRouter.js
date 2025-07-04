const express = require("express");
const routerAchievement = express.Router();
const achievementController = require("../controller/AchievementController");
// const { authAdminMiddleware } = require("../middleware/authMiddleware");

// routerAchievement.use(authAdminMiddleware);
routerAchievement.post("/", achievementController.createAchievement);
routerAchievement.get(
  "/topUserAchievement",
  achievementController.getLeaderboard
);
routerAchievement.get("/", achievementController.getAllAchievements);
routerAchievement.get("/:id", achievementController.getAchievementById);
routerAchievement.put("/:id", achievementController.updateAchievement);
routerAchievement.delete("/:id", achievementController.deleteAchievement);

module.exports = routerAchievement;
