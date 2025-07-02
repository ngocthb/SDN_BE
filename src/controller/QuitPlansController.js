const QuitPlansService = require("../services/QuitPlansService");
const jwt = require("jsonwebtoken");

// Lấy gợi ý kế hoạch dựa trên tình trạng hút thuốc
const getSuggestedPlan = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await QuitPlansService.getSuggestedPlan(userId);

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

// Tạo kế hoạch cai thuốc mới
const createQuitPlan = async (req, res) => {
    try {
        const { reason, customStages } = req.body;

        if (!reason || reason.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Lý do cai thuốc là bắt buộc"
            });
        }

        if (customStages && customStages.length > 0) {
            for (let i = 0; i < customStages.length; i++) {
                const stage = customStages[i];
                if (!stage.title || !stage.description || !stage.daysToComplete || stage.daysToComplete <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Giai đoạn ${i + 1}: title, description và daysToComplete (> 0) là bắt buộc`
                    });
                }
                stage.orderNumber = i + 1;
            }
        }

        const userId = req.user.id;

        const result = await QuitPlansService.createQuitPlan(userId, reason, customStages);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy kế hoạch hiện tại
const getCurrentPlan = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await QuitPlansService.getCurrentPlan(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật kế hoạch
const updateQuitPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const updates = req.body;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: "planId là bắt buộc"
            });
        }

        if (updates.stages && updates.stages.length > 0) {
            for (let i = 0; i < updates.stages.length; i++) {
                const stage = updates.stages[i];
                if (!stage.title || !stage.description || !stage.daysToComplete || stage.daysToComplete <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Giai đoạn ${i + 1}: title, description và daysToComplete (> 0) là bắt buộc`
                    });
                }
                stage.orderNumber = i + 1;
            }
        }

        const userId = req.user.id;

        const result = await QuitPlansService.updateQuitPlan(planId, userId, updates);

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

// Hoàn thành kế hoạch
const completePlan = async (req, res) => {
    try {
        const { planId } = req.params;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: "planId là bắt buộc"
            });
        }

        const userId = req.user.id;

        const result = await QuitPlansService.completePlan(planId, userId);

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

// Hủy kế hoạch
const cancelPlan = async (req, res) => {
    try {
        const { planId } = req.params;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: "planId là bắt buộc"
            });
        }

        const userId = req.user.id;

        const result = await QuitPlansService.cancelPlan(planId, userId);

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

// Lấy lịch sử kế hoạch
const getPlanHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await QuitPlansService.getPlanHistory(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy giai đoạn hiện tại
const getCurrentStage = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await QuitPlansService.getCurrentStage(userId);

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

// Lấy thông tin chi tiết giai đoạn
const getStageById = async (req, res) => {
    try {
        const { stageId } = req.params;
        const userId = req.user.id;

        if (!stageId) {
            return res.status(400).json({
                success: false,
                message: "stageId là bắt buộc"
            });
        }

        const result = await QuitPlansService.getStageById(userId, stageId);

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
    getSuggestedPlan,
    createQuitPlan,
    getCurrentPlan,
    updateQuitPlan,
    completePlan,
    cancelPlan,
    getPlanHistory,
    getCurrentStage,
    getStageById
};