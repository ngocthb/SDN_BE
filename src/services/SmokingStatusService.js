const SmokingStatusModel = require("../models/SmokingStatusModel");
const UserModel = require("../models/UserModel");
const QuitPlansModel = require("../models/QuitPlansModel");

// Tạo hoặc cập nhật tình trạng hút thuốc
const createOrUpdateSmokingStatus = async (userId, cigarettesPerDay, pricePerCigarette) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            };
        }

        if (cigarettesPerDay < 0 || pricePerCigarette < 0) {
            return {
                success: false,
                message: "Số lượng thuốc và giá tiền phải là số dương"
            };
        }

        const existingStatus = await SmokingStatusModel.findOne({ userId: userId });

        if (existingStatus) {
            existingStatus.cigarettesPerDay = cigarettesPerDay;
            existingStatus.pricePerCigarette = pricePerCigarette;
            await existingStatus.save();

            const updatedStatus = await SmokingStatusModel.findOne({ userId: userId })
                .populate("userId", "name email");

            return {
                success: true,
                data: updatedStatus,
                message: "Cập nhật tình trạng hút thuốc thành công"
            };
        } else {
            const newSmokingStatus = new SmokingStatusModel({
                userId: userId,
                cigarettesPerDay: cigarettesPerDay,
                pricePerCigarette: pricePerCigarette
            });

            const savedStatus = await newSmokingStatus.save();
            const populatedStatus = await SmokingStatusModel.findById(savedStatus._id)
                .populate("userId", "name email");

            return {
                success: true,
                data: populatedStatus,
                message: "Ghi nhận tình trạng hút thuốc thành công"
            };
        }

    } catch (error) {
        throw new Error(`Lỗi khi ghi nhận tình trạng hút thuốc: ${error.message}`);
    }
};

// Lấy thông tin tình trạng hút thuốc
const getSmokingStatus = async (userId) => {
    try {
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId })
            .populate("userId", "name email");

        if (!smokingStatus) {
            return {
                success: true,
                data: null,
                message: "Chưa có thông tin về tình trạng hút thuốc"
            };
        }

        return {
            success: true,
            data: smokingStatus,
            message: "Lấy thông tin tình trạng hút thuốc thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy tình trạng hút thuốc: ${error.message}`);
    }
};

// Tính toán chi phí hút thuốc
const calculateSmokingCost = async (userId, days = 30) => {
    try {
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId });

        if (!smokingStatus) {
            return {
                success: false,
                message: "Chưa có thông tin về tình trạng hút thuốc"
            };
        }

        const dailyCost = smokingStatus.cigarettesPerDay * smokingStatus.pricePerCigarette;
        const totalCost = dailyCost * days;

        return {
            success: true,
            data: {
                cigarettesPerDay: smokingStatus.cigarettesPerDay,
                pricePerCigarette: smokingStatus.pricePerCigarette,
                dailyCost: dailyCost,
                totalCost: totalCost,
                days: days,
                totalCigarettes: smokingStatus.cigarettesPerDay * days
            },
            message: `Tính toán chi phí hút thuốc trong ${days} ngày thành công`
        };

    } catch (error) {
        throw new Error(`Lỗi khi tính toán chi phí hút thuốc: ${error.message}`);
    }
};

// Xóa thông tin tình trạng hút thuốc
const deleteSmokingStatus = async (userId) => {
    try {
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId });

        if (!smokingStatus) {
            return {
                success: false,
                message: "Không tìm thấy thông tin hút thuốc để xóa"
            };
        }

        const activeQuitPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        });

        if (activeQuitPlan) {
            return {
                success: false,
                message: "Không thể xóa thông tin hút thuốc vì bạn đang có kế hoạch cai thuốc đang thực hiện. Vui lòng hoàn thành hoặc hủy kế hoạch trước khi xóa thông tin hút thuốc.",
                data: {
                    hasActiveQuitPlan: true,
                    quitPlanId: activeQuitPlan._id,
                    suggestion: "Hãy hoàn thành kế hoạch cai thuốc hiện tại hoặc hủy kế hoạch nếu muốn xóa thông tin hút thuốc."
                }
            };
        }

        await SmokingStatusModel.findOneAndDelete({ userId: userId });

        return {
            success: true,
            message: "Xóa thông tin hút thuốc thành công. Chúc mừng bạn đã bỏ thuốc!"
        };

    } catch (error) {
        throw new Error(`Lỗi khi xóa thông tin hút thuốc: ${error.message}`);
    }
};

module.exports = {
    createOrUpdateSmokingStatus,
    getSmokingStatus,
    calculateSmokingCost,
    deleteSmokingStatus,
};