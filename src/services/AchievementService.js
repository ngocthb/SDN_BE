const AchievementsModel = require("../models/AchievementsModel");
const mongoose = require("mongoose");
const ProgressLogsModel = require("../models/ProgressLogsModel");
const SmokingStatusModel = require("../models/SmokingStatusModel");
const UserModel = require("../models/UserModel");

exports.validateAchievement = async (data) => {
  const { name, description, icon, points } = data;

  if (!name || !name.trim()) {
    throw new Error("Achievement name is required.");
  }
  if (!description || !description.trim()) {
    throw new Error("Achievement description is required.");
  }
  if (!icon || !icon.trim()) {
    throw new Error("Achievement icon is required.");
  }
  if (typeof points !== "number" || points < 0) {
    throw new Error("Points must be a non-negative number.");
  }
};

exports.createAchievement = async (data) => {
  await this.validateAchievement(data);

  const newAchievement = await AchievementsModel.create({
    name: data.name.trim(),
    description: data.description.trim(),
    icon: data.icon.trim(),
    points: data.points,
  });

  return newAchievement;
};

exports.getAllAchievements = async () => {
  return await AchievementsModel.find().sort({ createdAt: -1 });
};

exports.getAchievementById = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid achievement id.");
  }
  const achievement = await AchievementsModel.findById(id);
  if (!achievement) {
    throw new Error("Achievement not found.");
  }
  return achievement;
};

exports.updateAchievement = async (id, data) => {
  await this.validateAchievement(data);

  const updated = await AchievementsModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updated) {
    throw new Error("Achievement not found.");
  }
  return updated;
};

exports.deleteAchievement = async (id) => {
  const deleted = await AchievementsModel.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error("Achievement not found.");
  }
  return deleted;
};

exports.evaluateAndGrantAchievements = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId.");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isAdmin || user.isCoach) {
    throw new Error("Admin or coach cannot receive achievements.");
  }

  const smokingStatus = await SmokingStatusModel.findOne({ userId });
  if (!smokingStatus) {
    throw new Error(
      "Smoking status not found. Please set your smoking status."
    );
  }

  const progressLogs = await ProgressLogsModel.find({ userId }).sort({
    date: 1,
  });

  // Tính toán các chỉ số
  let consecutiveSmokeFreeDays = 0;
  let totalSmokeFreeDays = 0;
  let totalMoneySaved = 0;
  let totalCigarettesNotSmoked = 0;

  let previousDate = null;

  for (const log of progressLogs) {
    if (log.cigarettesPerDay === 0) {
      if (
        previousDate &&
        new Date(log.date).toDateString() ===
          new Date(previousDate.getTime() + 86400000).toDateString()
      ) {
        consecutiveSmokeFreeDays++;
      } else {
        consecutiveSmokeFreeDays = 1;
      }

      totalSmokeFreeDays++;
      totalMoneySaved +=
        smokingStatus.cigarettesPerDay * smokingStatus.pricePerCigarette;
      totalCigarettesNotSmoked += smokingStatus.cigarettesPerDay;
    } else {
      consecutiveSmokeFreeDays = 0;
    }

    previousDate = new Date(log.date);
  }

  // Lấy danh sách achievement chưa được cấp
  const grantedIds = user.grantedAchievements.map((id) => id.toString());
  const achievements = await AchievementsModel.find();

  const newAchievements = [];

  for (const achievement of achievements) {
    if (grantedIds.includes(achievement._id.toString())) continue;

    if (
      (achievement.name.includes("1-Day") && consecutiveSmokeFreeDays >= 1) ||
      (achievement.name.includes("7-Day") && consecutiveSmokeFreeDays >= 7) ||
      (achievement.name.includes("30-Day") && consecutiveSmokeFreeDays >= 30) ||
      (achievement.name.includes("100.000vnđ") && totalMoneySaved >= 100000) ||
      (achievement.name.includes("500.000vnđ") && totalMoneySaved >= 500000) ||
      (achievement.name.includes("100 Cigarettes") &&
        totalCigarettesNotSmoked >= 100)
    ) {
      user.grantedAchievements.push(achievement._id);
      newAchievements.push(achievement);
    }
  }

  if (newAchievements.length > 0) {
    await user.save();
  }

  return newAchievements;
};

exports.getTopUsersByAchievements = async (limit = 5) => {
  // Lấy tất cả user, loại trừ admin hoặc coach
  const users = await UserModel.find({
    isAdmin: false,
    isCoach: false,
  })
    .populate("grantedAchievements")
    .select("-passwordHash -verifyOTP -verifyOTPExpires")
    .lean();

  // Tính tổng điểm achievement cho từng user
  const usersWithPoints = users.map((user) => {
    const totalPoints = (user.grantedAchievements || []).reduce(
      (sum, ach) => sum + (ach.points || 0),
      0
    );

    return {
      ...user,
      totalPoints,
    };
  });

  // Sắp xếp theo tổng điểm giảm dần và lấy top N
 const sortedUsers = usersWithPoints
  .filter((u) => u.totalPoints > 0)
  .sort((a, b) => b.totalPoints - a.totalPoints)
  .slice(0, limit);

  return sortedUsers;
};

exports.getMyAchievements = async (userId) => {
  const user = await UserModel.findById(userId)
    .populate("grantedAchievements")
    .select("grantedAchievements");

  if (!user) {
    throw new Error("User not found.");
  }

  return user.grantedAchievements;
};

