const SubscriptionsService = require("../services/SubscriptionsService");

// // Lấy tất cả gói membership
// const getAllMemberships = async (req, res) => {
//     try {
//         const result = await SubscriptionsService.getAllMemberships();
//         return res.status(200).json(result);
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Lấy chi tiết một gói membership
// const getMembershipById = async (req, res) => {
//     try {
//         const { membershipId } = req.params;
//         const result = await SubscriptionsService.getMembershipById(membershipId);

//         if (!result.success) {
//             return res.status(404).json(result);
//         }

//         return res.status(200).json(result);
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// Lấy subscription hiện tại của user
const getCurrentSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await SubscriptionsService.getCurrentSubscription(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Đăng ký gói mới
const createSubscription = async (req, res) => {
    try {
        const { membershipId, paymentId } = req.body;

        if (!membershipId || !paymentId) {
            return res.status(400).json({
                success: false,
                message: "membershipId và paymentId là bắt buộc"
            });
        }

        const userId = req.user.id;

        const result = await SubscriptionsService.createSubscription(userId, membershipId, paymentId);

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

// Hủy subscription
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await SubscriptionsService.cancelSubscription(userId);

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

// Lấy lịch sử subscription
const getSubscriptionHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await SubscriptionsService.getSubscriptionHistory(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Gia hạn subscription
const extendSubscription = async (req, res) => {
    try {
        const { membershipId, paymentId } = req.body;

        if (!membershipId || !paymentId) {
            return res.status(400).json({
                success: false,
                message: "membershipId và paymentId là bắt buộc"
            });
        }

        const userId = req.user.id;

        const result = await SubscriptionsService.extendSubscription(userId, membershipId, paymentId);

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

module.exports = {
    // getAllMemberships,
    // getMembershipById,
    getCurrentSubscription,
    createSubscription,
    cancelSubscription,
    getSubscriptionHistory,
    extendSubscription
};