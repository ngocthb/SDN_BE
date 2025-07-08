const ProgressLogsService = require("../services/ProgressLogsService");
const jwt = require("jsonwebtoken");

// Ghi nhận tiến trình hàng ngày
const logDailyProgress = async (req, res) => {
    try {
        const { cigarettesPerDay, healthNote, mood } = req.body;

        // Validation
        if (cigarettesPerDay === undefined || cigarettesPerDay === null) {
            return res.status(400).json({
                success: false,
                message: "cigarettesPerDay là bắt buộc"
            });
        }

        if (typeof cigarettesPerDay !== 'number') {
            return res.status(400).json({
                success: false,
                message: "cigarettesPerDay phải là số"
            });
        }

        const userId = req.user.id;

        const result = await ProgressLogsService.logDailyProgress(
            userId,
            cigarettesPerDay,
            healthNote || "",
            mood || ""
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tiến trình theo khoảng thời gian
const getProgressLogs = async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;

        // Validation cho limit
        const limitNumber = limit ? parseInt(limit) : 30;
        if (limitNumber <= 0 || limitNumber > 365) {
            return res.status(400).json({
                success: false,
                message: "Limit phải từ 1 đến 365"
            });
        }

        // Validation cho dates
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({
                success: false,
                message: "startDate không hợp lệ (định dạng: YYYY-MM-DD)"
            });
        }

        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({
                success: false,
                message: "endDate không hợp lệ (định dạng: YYYY-MM-DD)"
            });
        }

        const userId = req.user.id;

        const result = await ProgressLogsService.getProgressLogs(
            userId,
            startDate,
            endDate,
            limitNumber
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy thống kê tổng quan
const getProgressStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await ProgressLogsService.getProgressStatistics(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy biểu đồ tiến trình
const getProgressChart = async (req, res) => {
    try {
        const { days } = req.query;

        // Validation cho days
        const daysNumber = days ? parseInt(days) : 30;
        if (daysNumber <= 0 || daysNumber > 365) {
            return res.status(400).json({
                success: false,
                message: "Days phải từ 1 đến 365"
            });
        }

        const userId = req.user.id;

        const result = await ProgressLogsService.getProgressChart(userId, daysNumber);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa log tiến trình
const deleteProgressLog = async (req, res) => {
    try {
        const { logId } = req.params;

        if (!logId) {
            return res.status(400).json({
                success: false,
                message: "logId là bắt buộc"
            });
        }

        const userId = req.user.id;

        const result = await ProgressLogsService.deleteProgressLog(userId, logId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy log hôm nay
const getTodayProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // ✅ FIX: Sử dụng cùng logic với chart
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        console.log('Today range:', {
            today: today.toISOString(),
            tomorrow: tomorrow.toISOString(),
            localToday: today.toLocaleDateString('vi-VN')
        });

        const result = await ProgressLogsService.getProgressLogs(
            userId,
            today.toISOString().split('T')[0], // "2025-07-08"
            today.toISOString().split('T')[0], // Same day
            1
        );

        return res.status(200).json({
            success: true,
            data: result.data.length > 0 ? result.data[0] : null,
            message: result.data.length > 0 ? "Đã có ghi nhận tiến trình hôm nay" : "Chưa ghi nhận tiến trình hôm nay"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    logDailyProgress,
    getProgressLogs,
    getProgressStatistics,
    getProgressChart,
    deleteProgressLog,
    getTodayProgress
};