const ProgressLogsModel = require("../models/ProgressLogsModel");
const QuitPlansModel = require("../models/QuitPlansModel");
const SmokingStatusModel = require("../models/SmokingStatusModel");
const UserModel = require("../models/UserModel");

// Ghi nhận tiến trình hàng ngày
const logDailyProgress = async (userId, cigarettesPerDay, healthNote = "", mood = "") => {
    try {
        // Kiểm tra user tồn tại
        const user = await UserModel.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            };
        }

        // Kiểm tra xem có kế hoạch cai thuốc đang active không
        const activePlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        });

        if (!activePlan) {
            return {
                success: false,
                message: "Bạn cần có kế hoạch cai thuốc đang thực hiện để ghi nhận tiến trình. Vui lòng tạo kế hoạch cai thuốc trước."
            };
        }

        // Validation
        if (cigarettesPerDay < 0) {
            return {
                success: false,
                message: "Số lượng thuốc không thể âm"
            };
        }

        // Kiểm tra xem đã có log cho ngày hôm nay chưa
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const existingLog = await ProgressLogsModel.findOne({
            userId: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (existingLog) {
            // Cập nhật log hiện tại
            existingLog.cigarettesPerDay = cigarettesPerDay;
            existingLog.healthNote = healthNote;
            existingLog.mood = mood;
            await existingLog.save();

            return {
                success: true,
                data: existingLog,
                message: "Cập nhật tiến trình hôm nay thành công"
            };
        } else {
            // Tạo log mới
            const newLog = new ProgressLogsModel({
                userId: userId,
                cigarettesPerDay: cigarettesPerDay,
                healthNote: healthNote,
                mood: mood,
                date: today
            });

            const savedLog = await newLog.save();
            const populatedLog = await ProgressLogsModel.findById(savedLog._id)
                .populate("userId", "name email");

            return {
                success: true,
                data: populatedLog,
                message: "Ghi nhận tiến trình thành công"
            };
        }

    } catch (error) {
        throw new Error(`Lỗi khi ghi nhận tiến trình: ${error.message}`);
    }
};

// Lấy tiến trình theo khoảng thời gian
const getProgressLogs = async (userId, startDate, endDate, limit = 30) => {
    try {
        const query = { userId: userId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const logs = await ProgressLogsModel.find(query)
            .sort({ date: -1 })
            .limit(limit)
            .populate("userId", "name email");

        return {
            success: true,
            data: logs,
            message: "Lấy tiến trình thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy tiến trình: ${error.message}`);
    }
};

// Thống kê tổng quan tiến trình cai thuốc
const getProgressStatistics = async (userId) => {
    try {
        // Lấy thông tin kế hoạch hiện tại
        const currentPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        });

        // Lấy thông tin hút thuốc ban đầu
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId });

        // Lấy tất cả logs
        const allLogs = await ProgressLogsModel.find({ userId: userId })
            .sort({ date: 1 });

        if (allLogs.length === 0) {
            return {
                success: true,
                data: {
                    totalDaysLogged: 0,
                    daysWithoutSmoking: 0,
                    longestStreakWithoutSmoking: 0,
                    averageCigarettesPerDay: 0,
                    totalMoneySaved: 0,
                    progressPercentage: 0,
                    healthImprovements: [],
                    moodTrends: {}
                },
                message: "Chưa có dữ liệu tiến trình"
            };
        }

        // Tính số ngày không hút thuốc
        const daysWithoutSmoking = allLogs.filter(log => log.cigarettesPerDay === 0).length;

        // Tính streak dài nhất không hút thuốc
        let longestStreak = 0;
        let currentStreak = 0;

        allLogs.forEach(log => {
            if (log.cigarettesPerDay === 0) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        // Tính trung bình điếu thuốc/ngày
        const totalCigarettes = allLogs.reduce((sum, log) => sum + log.cigarettesPerDay, 0);
        const averageCigarettesPerDay = totalCigarettes / allLogs.length;

        // Tính tiền tiết kiệm được
        let totalMoneySaved = 0;
        if (smokingStatus) {
            const originalCigarettesPerDay = smokingStatus.cigarettesPerDay;
            const pricePerCigarette = smokingStatus.pricePerCigarette;

            allLogs.forEach(log => {
                const savedCigarettes = Math.max(0, originalCigarettesPerDay - log.cigarettesPerDay);
                totalMoneySaved += savedCigarettes * pricePerCigarette;
            });
        }

        // Tính % tiến trình dựa trên kế hoạch
        let progressPercentage = 0;
        if (currentPlan) {
            const planStartDate = currentPlan.startDate;
            const planEndDate = currentPlan.expectedQuitDate;
            const totalPlanDays = Math.ceil((planEndDate - planStartDate) / (1000 * 60 * 60 * 24));
            const daysPassed = Math.ceil((new Date() - planStartDate) / (1000 * 60 * 60 * 24));
            progressPercentage = Math.min(Math.round((daysPassed / totalPlanDays) * 100), 100);
        }

        // Phân tích xu hướng tâm trạng
        const moodCounts = {};
        allLogs.forEach(log => {
            if (log.mood) {
                moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
            }
        });

        // Dự đoán cải thiện sức khỏe dựa trên ngày không hút thuốc
        const healthImprovements = getHealthImprovements(daysWithoutSmoking);

        // Thống kê theo tuần gần nhất
        const last7Days = allLogs.slice(-7);
        const weeklyAverage = last7Days.length > 0
            ? last7Days.reduce((sum, log) => sum + log.cigarettesPerDay, 0) / last7Days.length
            : 0;

        return {
            success: true,
            data: {
                totalDaysLogged: allLogs.length, // Tổng số ngày đã ghi nhận
                daysWithoutSmoking: daysWithoutSmoking, // Số ngày không hút thuốc
                longestStreakWithoutSmoking: longestStreak, // Streak dài nhất không hút thuốc
                averageCigarettesPerDay: Math.round(averageCigarettesPerDay * 100) / 100, // Trung bình điếu thuốc/ngày
                current7DaysAverage: Math.round(weeklyAverage * 100) / 100, // Trung bình điếu thuốc trong 7 ngày gần nhất
                totalMoneySaved: Math.round(totalMoneySaved), // Tổng tiền tiết kiệm được
                progressPercentage: progressPercentage, // % tiến trình dựa trên kế hoạch
                healthImprovements: healthImprovements, // Dự đoán cải thiện sức khỏe
                moodTrends: moodCounts, // Xu hướng tâm trạng
                recentLogs: allLogs.slice(-7), // 7 log gần nhất
                planInfo: currentPlan ? {
                    startDate: currentPlan.startDate,
                    expectedQuitDate: currentPlan.expectedQuitDate,
                    reason: currentPlan.reason
                } : null
            },
            message: "Thống kê tiến trình thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi thống kê tiến trình: ${error.message}`);
    }
};

// Hàm dự đoán cải thiện sức khỏe
const getHealthImprovements = (daysWithoutSmoking) => {
    const improvements = [];

    if (daysWithoutSmoking >= 1) {
        improvements.push({
            milestone: "20 phút đầu tiên",
            description: "Nhịp tim và huyết áp bắt đầu trở về bình thường",
            achieved: daysWithoutSmoking >= 1
        });
    }

    if (daysWithoutSmoking >= 1) {
        improvements.push({
            milestone: "12 giờ",
            description: "Mức carbon monoxide trong máu giảm về mức bình thường",
            achieved: daysWithoutSmoking >= 1
        });
    }

    if (daysWithoutSmoking >= 2) {
        improvements.push({
            milestone: "2-3 ngày",
            description: "Nicotine đã được loại bỏ hoàn toàn khỏi cơ thể",
            achieved: daysWithoutSmoking >= 2
        });
    }

    if (daysWithoutSmoking >= 7) {
        improvements.push({
            milestone: "1 tuần",
            description: "Vị giác và khứu giác bắt đầu cải thiện",
            achieved: daysWithoutSmoking >= 7
        });
    }

    if (daysWithoutSmoking >= 30) {
        improvements.push({
            milestone: "1 tháng",
            description: "Chức năng phổi cải thiện đáng kể, giảm ho và khó thở",
            achieved: daysWithoutSmoking >= 30
        });
    }

    if (daysWithoutSmoking >= 90) {
        improvements.push({
            milestone: "3 tháng",
            description: "Lưu thông máu tốt hơn, chức năng phổi tăng 30%",
            achieved: daysWithoutSmoking >= 90
        });
    }

    if (daysWithoutSmoking >= 365) {
        improvements.push({
            milestone: "1 năm",
            description: "Nguy cơ bệnh tim giảm 50% so với người hút thuốc",
            achieved: daysWithoutSmoking >= 365
        });
    }

    return improvements;
};

// Lấy biểu đồ tiến trình
const getProgressChart = async (userId, days = 30) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const logs = await ProgressLogsModel.find({
            userId: userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        // Tạo dữ liệu cho biểu đồ
        const chartData = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const log = logs.find(l => l.date.toISOString().split('T')[0] === dateString);

            chartData.push({
                date: dateString,
                cigarettesPerDay: log ? log.cigarettesPerDay : null,
                mood: log ? log.mood : null,
                hasHealthNote: log ? (log.healthNote && log.healthNote.trim() !== '') : false
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            success: true,
            data: {
                chartData: chartData,
                summary: {
                    totalLogs: logs.length,
                    averageCigarettes: logs.length > 0
                        ? Math.round((logs.reduce((sum, log) => sum + log.cigarettesPerDay, 0) / logs.length) * 100) / 100
                        : 0,
                    smokeFreedays: logs.filter(log => log.cigarettesPerDay === 0).length
                }
            },
            message: `Lấy biểu đồ tiến trình ${days} ngày thành công`
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy biểu đồ tiến trình: ${error.message}`);
    }
};

// Xóa log tiến trình
const deleteProgressLog = async (userId, logId) => {
    try {
        const log = await ProgressLogsModel.findOne({
            _id: logId,
            userId: userId
        });

        if (!log) {
            return {
                success: false,
                message: "Không tìm thấy bản ghi tiến trình"
            };
        }

        await ProgressLogsModel.findByIdAndDelete(logId);

        return {
            success: true,
            message: "Xóa bản ghi tiến trình thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi xóa bản ghi tiến trình: ${error.message}`);
    }
};

module.exports = {
    logDailyProgress,
    getProgressLogs,
    getProgressStatistics,
    getProgressChart,
    deleteProgressLog
};