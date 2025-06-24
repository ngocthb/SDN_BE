const SmokingStatusService = require("../services/SmokingStatusService");
const jwt = require("jsonwebtoken");

// Tạo hoặc cập nhật tình trạng hút thuốc
const createOrUpdateSmokingStatus = async (req, res) => {
    try {
        const { cigarettesPerDay, pricePerCigarette } = req.body;

        if (cigarettesPerDay === undefined || pricePerCigarette === undefined) {
            return res.status(400).json({
                success: false,
                message: "cigarettesPerDay và pricePerCigarette là bắt buộc"
            });
        }

        if (typeof cigarettesPerDay !== 'number' || typeof pricePerCigarette !== 'number') {
            return res.status(400).json({
                success: false,
                message: "cigarettesPerDay và pricePerCigarette phải là số"
            });
        }

        const userId = req.user.id;

        const result = await SmokingStatusService.createOrUpdateSmokingStatus(
            userId,
            cigarettesPerDay,
            pricePerCigarette
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

// Lấy tình trạng hút thuốc hiện tại
const getSmokingStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await SmokingStatusService.getSmokingStatus(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Tính toán chi phí hút thuốc
const calculateSmokingCost = async (req, res) => {
    try {
        const { days } = req.query;
        const daysNumber = days ? parseInt(days) : 30; // Mặc định 30 ngày

        if (daysNumber <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số ngày phải là số dương"
            });
        }

        const userId = req.user.id;

        const result = await SmokingStatusService.calculateSmokingCost(userId, daysNumber);

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

// Xóa thông tin hút thuốc
const deleteSmokingStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await SmokingStatusService.deleteSmokingStatus(userId);

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

module.exports = {
    createOrUpdateSmokingStatus,
    getSmokingStatus,
    calculateSmokingCost,
    deleteSmokingStatus,
};