const QuitPlansModel = require("../models/QuitPlansModel");
const PlanStagesModel = require("../models/PlanStagesModel");
const SmokingStatusModel = require("../models/SmokingStatusModel");
const UserModel = require("../models/UserModel");

// Template kế hoạch cai thuốc mặc định
const getDefaultPlanTemplate = (cigarettesPerDay) => {
    let planDuration = 30; // Mặc định 30 ngày
    let stages = [];

    if (cigarettesPerDay <= 10) {
        // Người hút ít thuốc - kế hoạch 21 ngày
        planDuration = 21;
        stages = [
            {
                title: "Chuẩn bị tinh thần",
                description: "Xác định động lực và chuẩn bị tinh thần để bỏ thuốc. Thông báo cho gia đình và bạn bè về quyết định của bạn.",
                orderNumber: 1,
                daysToComplete: 3
            },
            {
                title: "Giảm dần số lượng",
                description: `Giảm từ ${cigarettesPerDay} điếu xuống còn ${Math.ceil(cigarettesPerDay / 2)} điếu mỗi ngày. Tránh hút thuốc vào những thời điểm nhất định trong ngày.`,
                orderNumber: 2,
                daysToComplete: 5
            },
            {
                title: "Giảm mạnh",
                description: `Chỉ hút ${Math.ceil(cigarettesPerDay / 4)} điếu mỗi ngày. Thay thế việc hút thuốc bằng các hoạt động khác như nhai kẹo cao su, uống nước.`,
                orderNumber: 3,
                daysToComplete: 5
            },
            {
                title: "Ngừng hoàn toàn",
                description: "Ngừng hút thuốc hoàn toàn. Tập trung vào các hoạt động thể thao nhẹ và giữ tinh thần tích cực.",
                orderNumber: 4,
                daysToComplete: 8
            }
        ];
    } else if (cigarettesPerDay <= 20) {
        // Người hút trung bình - kế hoạch 35 ngày
        planDuration = 35;
        stages = [
            {
                title: "Chuẩn bị và động lực",
                description: "Xác định lý do bỏ thuốc, chuẩn bị tinh thần và thu thập thông tin về tác hại của thuốc lá.",
                orderNumber: 1,
                daysToComplete: 5
            },
            {
                title: "Giảm 50% lượng thuốc",
                description: `Giảm từ ${cigarettesPerDay} điếu xuống còn ${Math.ceil(cigarettesPerDay / 2)} điếu mỗi ngày. Ghi chép lại thời gian và cảm xúc khi muốn hút thuốc.`,
                orderNumber: 2,
                daysToComplete: 7
            },
            {
                title: "Giảm 75% lượng thuốc",
                description: `Chỉ hút ${Math.ceil(cigarettesPerDay / 4)} điếu mỗi ngày. Bắt đầu tập thể dục nhẹ và thay đổi thói quen hàng ngày.`,
                orderNumber: 3,
                daysToComplete: 8
            },
            {
                title: "Giai đoạn chuyển tiếp",
                description: "Chỉ hút 1-2 điếu mỗi ngày vào những lúc căng thẳng nhất. Tìm các hoạt động thay thế như thiền, đọc sách.",
                orderNumber: 4,
                daysToComplete: 7
            },
            {
                title: "Ngừng hoàn toàn",
                description: "Ngừng hút thuốc hoàn toàn. Duy trì lối sống lành mạnh và tráxa xa môi trường có khói thuốc.",
                orderNumber: 5,
                daysToComplete: 8
            }
        ];
    } else {
        // Người hút nhiều thuốc - kế hoạch 45 ngày
        planDuration = 45;
        stages = [
            {
                title: "Tư vấn và chuẩn bị",
                description: "Tham khảo ý kiến bác sĩ, chuẩn bị tinh thần và xây dựng hệ thống hỗ trợ từ gia đình, bạn bè.",
                orderNumber: 1,
                daysToComplete: 7
            },
            {
                title: "Giảm dần giai đoạn 1",
                description: `Giảm từ ${cigarettesPerDay} điếu xuống còn ${Math.ceil(cigarettesPerDay * 0.7)} điếu mỗi ngày. Loại bỏ thuốc lá khỏi những thói quen nhất định.`,
                orderNumber: 2,
                daysToComplete: 8
            },
            {
                title: "Giảm dần giai đoạn 2",
                description: `Giảm xuống còn ${Math.ceil(cigarettesPerDay * 0.4)} điếu mỗi ngày. Bắt đầu sử dụng các phương pháp hỗ trợ như kẹo cao su nicotine (nếu cần).`,
                orderNumber: 3,
                daysToComplete: 10
            },
            {
                title: "Giảm mạnh",
                description: `Chỉ hút ${Math.ceil(cigarettesPerDay * 0.1)} điếu mỗi ngày. Tăng cường hoạt động thể chất và các sở thích khác.`,
                orderNumber: 4,
                daysToComplete: 10
            },
            {
                title: "Ngừng hoàn toàn",
                description: "Ngừng hút thuốc hoàn toàn. Duy trì chế độ ăn uống và tập luyện để giảm căng thẳng.",
                orderNumber: 5,
                daysToComplete: 10
            }
        ];
    }

    return { planDuration, stages };
};

// Tạo kế hoạch cai thuốc mới
const createQuitPlan = async (userId, reason, customStages = null) => {
    try {
        // Kiểm tra user tồn tại
        const user = await UserModel.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "Người dùng không tồn tại"
            };
        }

        // Kiểm tra xem user đã có kế hoạch đang active chưa
        const existingPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        });

        if (existingPlan) {
            return {
                success: false,
                message: "Bạn đã có kế hoạch cai thuốc đang thực hiện. Vui lòng hoàn thành hoặc hủy kế hoạch hiện tại trước khi tạo kế hoạch mới."
            };
        }

        // Lấy thông tin tình trạng hút thuốc
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId });
        let planTemplate;

        if (customStages && customStages.length > 0) {
            // Sử dụng kế hoạch tùy chỉnh
            const totalDays = customStages.reduce((sum, stage) => sum + stage.daysToComplete, 0);
            planTemplate = {
                planDuration: totalDays,
                stages: customStages
            };
        } else {
            // Sử dụng template mặc định
            const cigarettesPerDay = smokingStatus ? smokingStatus.cigarettesPerDay : 15;
            planTemplate = getDefaultPlanTemplate(cigarettesPerDay);
        }

        // Tính ngày bắt đầu và ngày dự kiến hoàn thành
        const startDate = new Date();
        const expectedQuitDate = new Date();
        expectedQuitDate.setDate(startDate.getDate() + planTemplate.planDuration);

        // Tạo kế hoạch chính
        const newQuitPlan = new QuitPlansModel({
            userId: userId,
            reason: reason,
            startDate: startDate,
            expectedQuitDate: expectedQuitDate,
            isActive: true
        });

        const savedPlan = await newQuitPlan.save();

        // Tạo các giai đoạn
        const stagePromises = planTemplate.stages.map(stage => {
            const newStage = new PlanStagesModel({
                quitPlansId: savedPlan._id,
                title: stage.title,
                description: stage.description,
                orderNumber: stage.orderNumber,
                daysToComplete: stage.daysToComplete
            });
            return newStage.save();
        });

        await Promise.all(stagePromises);

        // Lấy kế hoạch đầy đủ với các giai đoạn
        const completePlan = await QuitPlansModel.findById(savedPlan._id)
            .populate("userId", "name email");

        const stages = await PlanStagesModel.find({ quitPlansId: savedPlan._id })
            .sort({ orderNumber: 1 });

        return {
            success: true,
            data: {
                plan: completePlan,
                stages: stages,
                totalDays: planTemplate.planDuration,
                smokingInfo: smokingStatus
            },
            message: "Tạo kế hoạch cai thuốc thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi tạo kế hoạch cai thuốc: ${error.message}`);
    }
};

// Lấy gợi ý kế hoạch dựa trên tình trạng hút thuốc
const getSuggestedPlan = async (userId) => {
    try {
        const smokingStatus = await SmokingStatusModel.findOne({ userId: userId });

        if (!smokingStatus) {
            return {
                success: false,
                message: "Vui lòng cập nhật thông tin tình trạng hút thuốc trước khi tạo kế hoạch"
            };
        }

        const cigarettesPerDay = smokingStatus.cigarettesPerDay;
        const planTemplate = getDefaultPlanTemplate(cigarettesPerDay);

        return {
            success: true,
            data: {
                cigarettesPerDay: cigarettesPerDay,
                suggestedDuration: planTemplate.planDuration,
                suggestedStages: planTemplate.stages,
                recommendations: {
                    difficulty: cigarettesPerDay <= 10 ? "Dễ" : cigarettesPerDay <= 20 ? "Trung bình" : "Khó",
                    successRate: cigarettesPerDay <= 10 ? "85%" : cigarettesPerDay <= 20 ? "70%" : "55%",
                    tips: [
                        "Uống nhiều nước và ăn trái cây",
                        "Tập thể dục thường xuyên",
                        "Tráxa xa môi trường có khói thuốc",
                        "Tìm sự hỗ trợ từ gia đình và bạn bè"
                    ]
                }
            },
            message: "Lấy gợi ý kế hoạch thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy gợi ý kế hoạch: ${error.message}`);
    }
};

// Lấy kế hoạch hiện tại của user
const getCurrentPlan = async (userId) => {
    try {
        const currentPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        }).populate("userId", "name email");

        if (!currentPlan) {
            return {
                success: true,
                data: null,
                message: "Chưa có kế hoạch cai thuốc nào đang thực hiện"
            };
        }

        const stages = await PlanStagesModel.find({
            quitPlansId: currentPlan._id
        }).sort({ orderNumber: 1 });

        const now = new Date();
        const daysPassed = Math.floor((now - currentPlan.startDate) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((currentPlan.expectedQuitDate - currentPlan.startDate) / (1000 * 60 * 60 * 24));
        const progressPercentage = Math.min(Math.round((daysPassed / totalDays) * 100), 100);

        let currentStage = null;
        let dayCounter = 0;
        for (let stage of stages) {
            if (daysPassed >= dayCounter && daysPassed < dayCounter + stage.daysToComplete) {
                currentStage = {
                    ...stage.toObject(),
                    daysInStage: daysPassed - dayCounter,
                    remainingDaysInStage: stage.daysToComplete - (daysPassed - dayCounter)
                };
                break;
            }
            dayCounter += stage.daysToComplete;
        }

        return {
            success: true,
            data: {
                plan: currentPlan,
                stages: stages,
                progress: {
                    daysPassed: daysPassed,
                    totalDays: totalDays,
                    remainingDays: totalDays - daysPassed,
                    progressPercentage: progressPercentage,
                    currentStage: currentStage
                }
            },
            message: "Lấy kế hoạch hiện tại thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy kế hoạch hiện tại: ${error.message}`);
    }
};

// Cập nhật kế hoạch
const updateQuitPlan = async (planId, userId, updates) => {
    try {
        const plan = await QuitPlansModel.findOne({
            _id: planId,
            userId: userId,
            isActive: true
        });

        if (!plan) {
            return {
                success: false,
                message: "Không tìm thấy kế hoạch hoặc kế hoạch đã hoàn thành"
            };
        }

        if (updates.reason) plan.reason = updates.reason;
        if (updates.expectedQuitDate) plan.expectedQuitDate = new Date(updates.expectedQuitDate);

        await plan.save();

        if (updates.stages && updates.stages.length > 0) {
            await PlanStagesModel.deleteMany({ quitPlansId: planId });

            const stagePromises = updates.stages.map(stage => {
                const newStage = new PlanStagesModel({
                    quitPlansId: planId,
                    title: stage.title,
                    description: stage.description,
                    orderNumber: stage.orderNumber,
                    daysToComplete: stage.daysToComplete
                });
                return newStage.save();
            });

            await Promise.all(stagePromises);
        }

        const updatedPlan = await QuitPlansModel.findById(planId)
            .populate("userId", "name email");
        const stages = await PlanStagesModel.find({ quitPlansId: planId })
            .sort({ orderNumber: 1 });

        return {
            success: true,
            data: {
                plan: updatedPlan,
                stages: stages
            },
            message: "Cập nhật kế hoạch thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi cập nhật kế hoạch: ${error.message}`);
    }
};

// Hoàn thành kế hoạch
const completePlan = async (planId, userId) => {
    try {
        const plan = await QuitPlansModel.findOne({
            _id: planId,
            userId: userId,
            isActive: true
        });

        if (!plan) {
            return {
                success: false,
                message: "Không tìm thấy kế hoạch đang thực hiện"
            };
        }

        plan.isActive = false;
        await plan.save();

        return {
            success: true,
            data: plan,
            message: "Chúc mừng! Bạn đã hoàn thành kế hoạch cai thuốc. Hãy tiếp tục duy trì lối sống không khói thuốc!"
        };

    } catch (error) {
        throw new Error(`Lỗi khi hoàn thành kế hoạch: ${error.message}`);
    }
};

// Hủy kế hoạch
const cancelPlan = async (planId, userId) => {
    try {
        const plan = await QuitPlansModel.findOne({
            _id: planId,
            userId: userId,
            isActive: true
        });

        if (!plan) {
            return {
                success: false,
                message: "Không tìm thấy kế hoạch đang thực hiện"
            };
        }

        plan.isActive = false;
        await plan.save();

        return {
            success: true,
            data: plan,
            message: "Đã hủy kế hoạch cai thuốc. Bạn có thể tạo kế hoạch mới bất cứ khi nào!"
        };

    } catch (error) {
        throw new Error(`Lỗi khi hủy kế hoạch: ${error.message}`);
    }
};

// Lấy lịch sử các kế hoạch
const getPlanHistory = async (userId) => {
    try {
        const plans = await QuitPlansModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate("userId", "name email");

        const plansWithStages = await Promise.all(
            plans.map(async (plan) => {
                const stages = await PlanStagesModel.find({
                    quitPlansId: plan._id
                }).sort({ orderNumber: 1 });

                return {
                    ...plan.toObject(),
                    stages: stages
                };
            })
        );

        return {
            success: true,
            data: plansWithStages,
            message: "Lấy lịch sử kế hoạch thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy lịch sử kế hoạch: ${error.message}`);
    }
};

// Lấy giai đoạn hiện tại của kế hoạch
const getCurrentStage = async (userId) => {
    try {
        // Lấy kế hoạch đang active
        const currentPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        }).populate("userId", "name email");

        if (!currentPlan) {
            return {
                success: false,
                message: "Không có kế hoạch cai thuốc nào đang thực hiện"
            };
        }

        // Lấy tất cả stages của kế hoạch
        const stages = await PlanStagesModel.find({
            quitPlansId: currentPlan._id
        }).sort({ orderNumber: 1 });

        if (stages.length === 0) {
            return {
                success: false,
                message: "Kế hoạch không có giai đoạn nào"
            };
        }

        // Tính số ngày đã trải qua từ khi bắt đầu kế hoạch
        const now = new Date();
        const daysPassed = Math.floor((now - currentPlan.startDate) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((currentPlan.expectedQuitDate - currentPlan.startDate) / (1000 * 60 * 60 * 24));

        // Tính tổng tiến độ toàn kế hoạch
        const overallProgressPercentage = Math.min(Math.max(Math.round((daysPassed / totalDays) * 100), 0), 100);

        // Tìm giai đoạn hiện tại
        let currentStage = null;
        let stageStartDay = 0;
        let stageIndex = 0;

        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageEndDay = stageStartDay + stage.daysToComplete;

            if (daysPassed >= stageStartDay && daysPassed < stageEndDay) {
                // Đang trong giai đoạn này
                const daysInCurrentStage = daysPassed - stageStartDay;
                const remainingDaysInStage = stage.daysToComplete - daysInCurrentStage;

                currentStage = {
                    ...stage.toObject(),
                    stageIndex: i + 1,
                    totalStages: stages.length,
                    stageStartDay: stageStartDay,
                    stageEndDay: stageEndDay - 1,
                    daysInCurrentStage: daysInCurrentStage,
                    remainingDaysInStage: remainingDaysInStage,
                    stageProgressPercentage: Math.round((daysInCurrentStage / stage.daysToComplete) * 100),
                    isCompleted: false,
                    status: "in_progress"
                };
                stageIndex = i;
                break;
            } else if (daysPassed >= stageEndDay && i === stages.length - 1) {
                // Đã hoàn thành tất cả các giai đoạn
                currentStage = {
                    ...stage.toObject(),
                    stageIndex: i + 1,
                    totalStages: stages.length,
                    stageStartDay: stageStartDay,
                    stageEndDay: stageEndDay - 1,
                    daysInCurrentStage: stage.daysToComplete,
                    remainingDaysInStage: 0,
                    stageProgressPercentage: 100,
                    isCompleted: true,
                    status: "completed_all"
                };
                stageIndex = i;
                break;
            }

            stageStartDay = stageEndDay;
        }

        // Nếu chưa bắt đầu giai đoạn nào (daysPassed < 0)
        if (!currentStage && daysPassed < 0) {
            currentStage = {
                ...stages[0].toObject(),
                stageIndex: 1,
                totalStages: stages.length,
                stageStartDay: 0,
                stageEndDay: stages[0].daysToComplete - 1,
                daysInCurrentStage: 0,
                remainingDaysInStage: stages[0].daysToComplete,
                stageProgressPercentage: 0,
                isCompleted: false,
                status: "not_started"
            };
            stageIndex = 0;
        }

        // Tính tiến độ từng giai đoạn với thông tin chi tiết
        const stagesWithProgress = stages.map((stage, index) => {
            let stageStart = 0;
            for (let j = 0; j < index; j++) {
                stageStart += stages[j].daysToComplete;
            }

            const stageEnd = stageStart + stage.daysToComplete;
            let stageStatus = "upcoming";
            let stageDaysCompleted = 0;
            let stageProgressPercent = 0;

            if (daysPassed >= stageEnd) {
                // Giai đoạn đã hoàn thành
                stageStatus = "completed";
                stageDaysCompleted = stage.daysToComplete;
                stageProgressPercent = 100;
            } else if (daysPassed >= stageStart) {
                // Giai đoạn đang thực hiện
                stageStatus = "in_progress";
                stageDaysCompleted = daysPassed - stageStart;
                stageProgressPercent = Math.round((stageDaysCompleted / stage.daysToComplete) * 100);
            }

            return {
                ...stage.toObject(),
                stageIndex: index + 1,
                stageStartDay: stageStart,
                stageEndDay: stageEnd - 1,
                status: stageStatus,
                daysCompleted: stageDaysCompleted,
                remainingDays: stage.daysToComplete - stageDaysCompleted,
                progressPercentage: stageProgressPercent
            };
        });

        // Lấy thông tin các giai đoạn theo trạng thái
        const previousStages = stagesWithProgress.filter(stage => stage.status === "completed");
        const nextStages = stagesWithProgress.filter(stage => stage.status === "upcoming");

        return {
            success: true,
            data: {
                currentStage: currentStage,
                previousStages: previousStages,
                nextStages: nextStages,
                allStagesWithProgress: stagesWithProgress, // Thêm thông tin tất cả stages
                planInfo: {
                    planId: currentPlan._id,
                    reason: currentPlan.reason,
                    startDate: currentPlan.startDate,
                    expectedQuitDate: currentPlan.expectedQuitDate,
                    daysPassed: daysPassed,
                    totalDays: totalDays,
                    remainingDays: Math.max(0, totalDays - daysPassed),
                    overallProgressPercentage: overallProgressPercentage // Tiến độ toàn kế hoạch
                }
            },
            message: currentStage ?
                (currentStage.status === "completed_all" ?
                    "Bạn đã hoàn thành tất cả các giai đoạn!" :
                    `Hiện tại bạn đang ở giai đoạn ${currentStage.stageIndex}: ${currentStage.title}`) :
                "Không xác định được giai đoạn hiện tại"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy giai đoạn hiện tại: ${error.message}`);
    }
};

// Lấy thông tin chi tiết giai đoạn theo ID
const getStageById = async (userId, stageId) => {
    try {
        // Kiểm tra xem stage có thuộc về kế hoạch của user không
        const currentPlan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        });

        if (!currentPlan) {
            return {
                success: false,
                message: "Không có kế hoạch cai thuốc nào đang thực hiện"
            };
        }

        const stage = await PlanStagesModel.findOne({
            _id: stageId,
            quitPlansId: currentPlan._id
        });

        if (!stage) {
            return {
                success: false,
                message: "Không tìm thấy giai đoạn này trong kế hoạch của bạn"
            };
        }

        // Lấy tất cả stages để tính toán vị trí
        const allStages = await PlanStagesModel.find({
            quitPlansId: currentPlan._id
        }).sort({ orderNumber: 1 });

        // Tính ngày bắt đầu của giai đoạn này
        let stageStartDay = 0;
        for (let i = 0; i < stage.orderNumber - 1; i++) {
            stageStartDay += allStages[i].daysToComplete;
        }

        const stageEndDay = stageStartDay + stage.daysToComplete - 1;
        const daysPassed = Math.floor((new Date() - currentPlan.startDate) / (1000 * 60 * 60 * 24));

        // Xác định trạng thái giai đoạn
        let status = "upcoming";
        let daysInStage = 0;
        let remainingDaysInStage = stage.daysToComplete;
        let progressPercentage = 0;

        if (daysPassed >= stageStartDay) {
            if (daysPassed <= stageEndDay) {
                status = "in_progress";
                daysInStage = daysPassed - stageStartDay;
                remainingDaysInStage = stage.daysToComplete - daysInStage;
                progressPercentage = Math.round((daysInStage / stage.daysToComplete) * 100);
            } else {
                status = "completed";
                daysInStage = stage.daysToComplete;
                remainingDaysInStage = 0;
                progressPercentage = 100;
            }
        }

        return {
            success: true,
            data: {
                ...stage.toObject(),
                stageStartDay: stageStartDay,
                stageEndDay: stageEndDay,
                daysInStage: daysInStage,
                remainingDaysInStage: remainingDaysInStage,
                progressPercentage: progressPercentage,
                status: status,
                totalStages: allStages.length
            },
            message: "Lấy thông tin giai đoạn thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy thông tin giai đoạn: ${error.message}`);
    }
};

module.exports = {
    createQuitPlan,
    getSuggestedPlan,
    getCurrentPlan,
    updateQuitPlan,
    completePlan,
    cancelPlan,
    getPlanHistory,
    getCurrentStage,
    getStageById
};