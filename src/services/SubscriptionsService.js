const SubscriptionModel = require("../models/SubscriptionsModel");
const MembershipModel = require("../models/MembershipModel");
const UserModel = require("../models/UserModel");

// // Lấy danh sách tất cả gói membership
// const getAllMemberships = async () => {
//     try {
//         const memberships = await MembershipModel.find({}).sort({ price: 1 });
//         return {
//             success: true,
//             data: memberships,
//             message: "Lấy danh sách gói thành viên thành công"
//         };
//     } catch (error) {
//         throw new Error(`Lỗi khi lấy danh sách gói: ${error.message}`);
//     }
// };

// // Lấy thông tin chi tiết một gói membership
// const getMembershipById = async (membershipId) => {
//     try {
//         const membership = await MembershipModel.findById(membershipId);
//         if (!membership) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy gói thành viên"
//             };
//         }

//         return {
//             success: true,
//             data: membership,
//             message: "Lấy thông tin gói thành công"
//         };
//     } catch (error) {
//         throw new Error(`Lỗi khi lấy thông tin gói: ${error.message}`);
//     }
// };

// Kiểm tra subscription hiện tại của user
const getCurrentSubscription = async (userId) => {
    try {
        const subscription = await SubscriptionModel.findOne({
            userId: userId,
            status: "active"
        }).populate("membershipId");

        return {
            success: true,
            data: subscription,
            message: subscription ? "Có gói đăng ký active" : "Không có gói đăng ký active"
        };
    } catch (error) {
        throw new Error(`Lỗi khi kiểm tra subscription: ${error.message}`);
    }
};

// Tạo subscription mới
const createSubscription = async (userId, membershipId, paymentId) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            };
        }

        const membership = await MembershipModel.findById(membershipId);
        if (!membership) {
            return {
                success: false,
                message: "Gói thành viên không tồn tại"
            };
        }

        const existingSubscription = await SubscriptionModel.findOne({
            userId: userId,
            status: "active"
        });

        if (existingSubscription) {
            return {
                success: false,
                message: "Bạn đã có gói đăng ký đang hoạt động. Vui lòng hủy gói hiện tại trước khi đăng ký gói mới",
                data: existingSubscription
            };
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + membership.duration);

        const newSubscription = new SubscriptionModel({
            userId: userId,
            membershipId: membershipId,
            startDate: startDate,
            endDate: endDate,
            status: "active",
            paymentId: paymentId
        });

        const savedSubscription = await newSubscription.save();

        const populatedSubscription = await SubscriptionModel.findById(savedSubscription._id)
            .populate("membershipId")
            .populate("userId", "name email");

        return {
            success: true,
            data: populatedSubscription,
            message: "Đăng ký gói thành viên thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi tạo subscription: ${error.message}`);
    }
};

// Hủy subscription
const cancelSubscription = async (userId) => {
    try {
        const subscription = await SubscriptionModel.findOne({
            userId: userId,
            status: "active"
        });

        if (!subscription) {
            return {
                success: false,
                message: "Không tìm thấy gói đăng ký đang hoạt động"
            };
        }

        subscription.status = "cancelled";
        await subscription.save();

        return {
            success: true,
            data: subscription,
            message: "Hủy gói đăng ký thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi hủy subscription: ${error.message}`);
    }
};

// Lấy lịch sử subscription của user
const getSubscriptionHistory = async (userId) => {
    try {
        const subscriptions = await SubscriptionModel.find({
            userId: userId
        })
            .populate("membershipId")
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: subscriptions,
            message: "Lấy lịch sử đăng ký thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy lịch sử subscription: ${error.message}`);
    }
};

// Gia hạn subscription
const extendSubscription = async (userId, membershipId, paymentId) => {
    try {
        const currentSubscription = await SubscriptionModel.findOne({
            userId: userId,
            status: "active"
        });

        if (!currentSubscription) {
            return {
                success: false,
                message: "Không có gói đăng ký đang hoạt động để gia hạn"
            };
        }

        const membership = await MembershipModel.findById(membershipId);
        if (!membership) {
            return {
                success: false,
                message: "Gói thành viên không tồn tại"
            };
        }

        const currentEndDate = new Date(currentSubscription.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(currentEndDate.getDate() + membership.duration);

        // Cập nhật subscription
        currentSubscription.endDate = newEndDate;
        currentSubscription.membershipId = membershipId;
        currentSubscription.paymentId = paymentId;

        await currentSubscription.save();

        const updatedSubscription = await SubscriptionModel.findById(currentSubscription._id)
            .populate("membershipId")
            .populate("userId", "name email");

        return {
            success: true,
            data: updatedSubscription,
            message: "Gia hạn gói thành viên thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi gia hạn subscription: ${error.message}`);
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