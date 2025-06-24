const SubscriptionModel = require("../models/SubscriptionsModel");

// Middleware kiểm tra thời hạn gói đăng ký
const checkSubscriptionExpiry = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token không được cung cấp"
            });
        }

        const userId = req.user.id;

        // Tìm subscription active của user
        const subscription = await SubscriptionModel.findOne({
            userId: userId,
            status: "active"
        }).populate("membershipId");

        // Kiểm tra nếu không có subscription active
        if (!subscription) {
            return res.status(403).json({
                success: false,
                message: "Bạn chưa có gói đăng ký hoặc gói đăng ký đã bị hủy",
                code: "NO_ACTIVE_SUBSCRIPTION"
            });
        }

        // Kiểm tra thời hạn
        const currentDate = new Date();
        const endDate = new Date(subscription.endDate);

        if (currentDate > endDate) {
            // Cập nhật status về expired
            await SubscriptionModel.findByIdAndUpdate(subscription._id, {
                status: "expired"
            });

            return res.status(403).json({
                success: false,
                message: "Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ",
                code: "SUBSCRIPTION_EXPIRED",
                data: {
                    membershipName: subscription.membershipId.name,
                    expiredDate: endDate.toISOString(),
                    expiredDays: Math.floor((currentDate - endDate) / (1000 * 60 * 60 * 24))
                }
            });
        }

        // Nếu subscription còn hạn, cho phép truy cập
        req.userId = userId;
        req.subscription = subscription;

        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        console.error("Lỗi kiểm tra subscription:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi kiểm tra gói đăng ký",
            error: error.message
        });
    }
};

module.exports = {
    checkSubscriptionExpiry
};