const QuitPlansModel = require("../models/QuitPlansModel");
const PlanStagesModel = require("../models/PlanStagesModel");
const SmokingStatusModel = require("../models/SmokingStatusModel");
const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");
const SubscriptionService = require("./SubscriptionService");

// Thêm hàm helper để kiểm tra subscription và tính ngày còn lại
const checkSubscriptionLimit = async (userId, requiredDays) => {
    try {
        const subscriptionResult = await SubscriptionService.getMySubscription(userId);

        if (!subscriptionResult.hasActiveSubscription) {
            return {
                isValid: false,
                message: "Bạn cần có gói đăng ký active để tạo kế hoạch tùy chỉnh",
                remainingDays: 0
            };
        }

        const subscription = subscriptionResult.subscription;
        const remainingDays = subscription.daysRemaining;

        if (requiredDays > remainingDays) {
            return {
                isValid: false,
                message: `Tổng số ngày của kế hoạch (${requiredDays} ngày) vượt quá thời hạn gói đăng ký còn lại (${remainingDays} ngày). Vui lòng giảm số ngày hoặc gia hạn gói đăng ký.`,
                remainingDays: remainingDays,
                requiredDays: requiredDays,
                excessDays: requiredDays - remainingDays
            };
        }

        return {
            isValid: true,
            message: "Kế hoạch phù hợp với thời hạn gói đăng ký",
            remainingDays: remainingDays,
            requiredDays: requiredDays
        };

    } catch (error) {
        console.error("Lỗi kiểm tra subscription:", error.message);
        return {
            isValid: false,
            message: "Không thể kiểm tra thông tin gói đăng ký. Vui lòng thử lại sau.",
            remainingDays: 0
        };
    }
};
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
            const totalCustomDays = customStages.reduce((sum, stage) => sum + stage.daysToComplete, 0);

            // Kiểm tra subscription limit
            const subscriptionCheck = await checkSubscriptionLimit(userId, totalCustomDays);
            if (!subscriptionCheck.isValid) {
                return {
                    success: false,
                    message: subscriptionCheck.message,
                    data: {
                        remainingDays: subscriptionCheck.remainingDays,
                        requiredDays: subscriptionCheck.requiredDays,
                        excessDays: subscriptionCheck.excessDays
                    }
                };
            }

            // Validation cơ bản cho custom stages
            for (let i = 0; i < customStages.length; i++) {
                const stage = customStages[i];

                if (!stage.title || stage.title.trim() === "") {
                    return {
                        success: false,
                        message: `Giai đoạn ${i + 1}: Tiêu đề không được để trống`
                    };
                }

                if (!stage.description || stage.description.trim() === "") {
                    return {
                        success: false,
                        message: `Giai đoạn ${i + 1}: Mô tả không được để trống`
                    };
                }

                if (!stage.daysToComplete || stage.daysToComplete <= 0) {
                    return {
                        success: false,
                        message: `Giai đoạn ${i + 1}: Số ngày hoàn thành phải lớn hơn 0`
                    };
                }

                if (stage.daysToComplete > 365) {
                    return {
                        success: false,
                        message: `Giai đoạn ${i + 1}: Số ngày hoàn thành không được vượt quá 365 ngày`
                    };
                }
            }

            // Sử dụng kế hoạch tùy chỉnh
            planTemplate = {
                planDuration: totalCustomDays,
                stages: customStages.map((stage, index) => ({
                    ...stage,
                    orderNumber: index + 1 // Tự động gán orderNumber
                }))
            };
        } else {
            // Sử dụng template mặc định
            const cigarettesPerDay = smokingStatus ? smokingStatus.cigarettesPerDay : 15;
            planTemplate = getDefaultPlanTemplate(cigarettesPerDay);

            const subscriptionCheck = await checkSubscriptionLimit(userId, planTemplate.planDuration);
            if (!subscriptionCheck.isValid) {
                return {
                    success: false,
                    message: `${subscriptionCheck.message} Bạn có thể tạo kế hoạch ngắn hơn hoặc gia hạn gói đăng ký.`,
                    data: {
                        remainingDays: subscriptionCheck.remainingDays,
                        requiredDays: subscriptionCheck.requiredDays,
                        excessDays: subscriptionCheck.excessDays,
                        suggestedMaxDays: subscriptionCheck.remainingDays
                    }
                };
            }
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
                    daysPassed: daysPassed, // Số ngày đã qua kể từ khi bắt đầu kế hoạch
                    totalDays: totalDays, // Tổng số ngày của kế hoạch
                    remainingDays: totalDays - daysPassed, // Số ngày còn lại
                    progressPercentage: progressPercentage, // Tiến độ tổng thể của kế hoạch
                    currentStage: currentStage // Giai đoạn hiện tại (nếu có)
                }
            },
            message: "Lấy kế hoạch hiện tại thành công"
        };

    } catch (error) {
        throw new Error(`Lỗi khi lấy kế hoạch hiện tại: ${error.message}`);
    }
};

// Cập nhật kế hoạch
// const updateQuitPlan = async (planId, userId, updates) => {
//     try {
//         const plan = await QuitPlansModel.findOne({
//             _id: planId,
//             userId: userId,
//             isActive: true
//         });

//         if (!plan) {
//             return {
//                 success: false,
//                 message: "Không tìm thấy kế hoạch hoặc kế hoạch đã hoàn thành"
//             };
//         }

//         // CHỈ cho phép cập nhật reason - KHÔNG cho cập nhật expectedQuitDate
//         if (updates.reason) {
//             plan.reason = updates.reason;
//             await plan.save();
//         }

//         // Xử lý cập nhật stages (nếu có)
//         if (updates.stages && updates.stages.length > 0) {
//             // Sử dụng getCurrentStage để lấy thông tin chi tiết về trạng thái các giai đoạn
//             const stageInfo = await getCurrentStage(userId);

//             if (!stageInfo.success) {
//                 return {
//                     success: false,
//                     message: "Không thể lấy thông tin giai đoạn để validation"
//                 };
//             }

//             const { allStagesWithProgress, planInfo } = stageInfo.data;

//             // Phân loại stages theo trạng thái từ getCurrentStage
//             const completedStages = allStagesWithProgress.filter(stage => stage.status === "completed");
//             const currentStage = allStagesWithProgress.find(stage => stage.status === "in_progress");
//             const upcomingStages = allStagesWithProgress.filter(stage => stage.status === "upcoming");

//             // Validation: kiểm tra xem có cố gắng update stage đã hoàn thành không
//             const invalidUpdates = [];
//             const stagesToKeep = []; // Các stage đã hoàn thành sẽ được giữ nguyên
//             const stagesToUpdate = []; // Các stage có thể cập nhật

//             // Giữ nguyên tất cả stages đã hoàn thành
//             completedStages.forEach(stage => {
//                 stagesToKeep.push({
//                     _id: stage._id,
//                     title: stage.title,
//                     description: stage.description,
//                     orderNumber: stage.orderNumber,
//                     daysToComplete: stage.daysToComplete,
//                     reason: "Đã hoàn thành - không thể chỉnh sửa"
//                 });
//             });

//             // Kiểm tra các stage trong updates
//             updates.stages.forEach(updateStage => {
//                 if (updateStage._id) {
//                     // Update stage có sẵn
//                     const existingStage = allStagesWithProgress.find(s => s._id.toString() === updateStage._id.toString());

//                     if (existingStage) {
//                         if (existingStage.status === "completed") {
//                             // Stage đã hoàn thành - không được phép chỉnh sửa
//                             invalidUpdates.push({
//                                 stageId: updateStage._id,
//                                 title: existingStage.title,
//                                 reason: "Giai đoạn đã hoàn thành - không thể chỉnh sửa"
//                             });
//                         } else if (existingStage.status === "in_progress") {
//                             // Stage đang thực hiện - chỉ cho phép sửa title và description
//                             if (updateStage.daysToComplete && updateStage.daysToComplete !== existingStage.daysToComplete) {
//                                 invalidUpdates.push({
//                                     stageId: updateStage._id,
//                                     title: existingStage.title,
//                                     reason: "Giai đoạn đang thực hiện - không thể thay đổi số ngày hoàn thành"
//                                 });
//                             } else if (updateStage.orderNumber && updateStage.orderNumber !== existingStage.orderNumber) {
//                                 invalidUpdates.push({
//                                     stageId: updateStage._id,
//                                     title: existingStage.title,
//                                     reason: "Giai đoạn đang thực hiện - không thể thay đổi thứ tự"
//                                 });
//                             } else {
//                                 // Cho phép cập nhật title và description cho stage đang thực hiện
//                                 stagesToUpdate.push({
//                                     _id: updateStage._id,
//                                     title: updateStage.title || existingStage.title,
//                                     description: updateStage.description || existingStage.description,
//                                     orderNumber: existingStage.orderNumber, // Giữ nguyên
//                                     daysToComplete: existingStage.daysToComplete, // Giữ nguyên
//                                     updateType: "limited" // Chỉ cập nhật một phần
//                                 });
//                             }
//                         } else {
//                             // Stage upcoming - cho phép cập nhật tất cả
//                             stagesToUpdate.push({
//                                 _id: updateStage._id,
//                                 title: updateStage.title,
//                                 description: updateStage.description,
//                                 orderNumber: updateStage.orderNumber,
//                                 daysToComplete: updateStage.daysToComplete,
//                                 updateType: "full" // Cập nhật đầy đủ
//                             });
//                         }
//                     }
//                 } else {
//                     // Stage mới - chỉ cho phép thêm vào cuối (order lớn hơn stage cuối cùng)
//                     const maxOrder = Math.max(...allStagesWithProgress.map(s => s.orderNumber));
//                     if (updateStage.orderNumber && updateStage.orderNumber <= maxOrder) {
//                         // Chỉ cho phép thêm stage mới ở cuối
//                         const lastCompletedOrder = completedStages.length > 0 ? Math.max(...completedStages.map(s => s.orderNumber)) : 0;
//                         const currentOrder = currentStage ? currentStage.orderNumber : 0;

//                         if (updateStage.orderNumber <= Math.max(lastCompletedOrder, currentOrder)) {
//                             invalidUpdates.push({
//                                 title: updateStage.title,
//                                 reason: "Không thể thêm giai đoạn mới vào giữa các giai đoạn đã bắt đầu"
//                             });
//                         } else {
//                             stagesToUpdate.push({
//                                 title: updateStage.title,
//                                 description: updateStage.description,
//                                 orderNumber: updateStage.orderNumber,
//                                 daysToComplete: updateStage.daysToComplete,
//                                 updateType: "new"
//                             });
//                         }
//                     } else {
//                         // Tự động gán order number
//                         stagesToUpdate.push({
//                             title: updateStage.title,
//                             description: updateStage.description,
//                             orderNumber: maxOrder + 1,
//                             daysToComplete: updateStage.daysToComplete,
//                             updateType: "new"
//                         });
//                     }
//                 }
//             });

//             // Nếu có lỗi validation, trả về lỗi
//             if (invalidUpdates.length > 0) {
//                 return {
//                     success: false,
//                     message: "Không thể cập nhật một số giai đoạn do vi phạm quy tắc chỉnh sửa",
//                     data: {
//                         invalidUpdates,
//                         validationRules: {
//                             completed: "Không được chỉnh sửa giai đoạn đã hoàn thành",
//                             in_progress: "Giai đoạn đang thực hiện chỉ được chỉnh sửa tiêu đề và mô tả",
//                             upcoming: "Giai đoạn chưa bắt đầu có thể chỉnh sửa tất cả thông tin",
//                             new_stages: "Chỉ được thêm giai đoạn mới vào cuối"
//                         },
//                         currentStageInfo: stageInfo.data
//                     }
//                 };
//             }

//             // Thực hiện cập nhật stages
//             if (stagesToUpdate.length > 0) {
//                 // Xóa các stages có thể cập nhật (không xóa stages đã hoàn thành)
//                 const stageIdsToDelete = stagesToUpdate
//                     .filter(stage => stage._id && stage.updateType !== "new")
//                     .map(stage => stage._id);

//                 if (stageIdsToDelete.length > 0) {
//                     await PlanStagesModel.deleteMany({
//                         _id: { $in: stageIdsToDelete }
//                     });
//                 }

//                 // Tạo lại các stages
//                 const stagePromises = stagesToUpdate.map(stage => {
//                     const newStage = new PlanStagesModel({
//                         quitPlansId: planId,
//                         title: stage.title,
//                         description: stage.description,
//                         orderNumber: stage.orderNumber,
//                         daysToComplete: stage.daysToComplete
//                     });
//                     return newStage.save();
//                 });

//                 await Promise.all(stagePromises);

//                 // Tự động tính toán lại expectedQuitDate dựa trên tổng thời gian stages
//                 const allStagesAfterUpdate = await PlanStagesModel.find({ quitPlansId: planId })
//                     .sort({ orderNumber: 1 });

//                 const totalStageDays = allStagesAfterUpdate.reduce((sum, stage) => sum + stage.daysToComplete, 0);
//                 const newExpectedQuitDate = new Date(plan.startDate);
//                 newExpectedQuitDate.setDate(newExpectedQuitDate.getDate() + totalStageDays);

//                 plan.expectedQuitDate = newExpectedQuitDate;
//                 await plan.save();
//             }
//         }

//         // Lấy kế hoạch đã cập nhật
//         const updatedPlan = await QuitPlansModel.findById(planId)
//             .populate("userId", "name email");
//         const stages = await PlanStagesModel.find({ quitPlansId: planId })
//             .sort({ orderNumber: 1 });

//         // Sử dụng lại getCurrentStage để lấy thông tin trạng thái mới
//         const updatedStageInfo = await getCurrentStage(userId);

//         return {
//             success: true,
//             data: {
//                 plan: updatedPlan,
//                 stages: stages,
//                 stageInfo: updatedStageInfo.success ? updatedStageInfo.data : null,
//                 updateSummary: {
//                     reasonUpdated: !!updates.reason,
//                     stagesUpdated: !!(updates.stages && updates.stages.length > 0),
//                     totalStages: stages.length,
//                     expectedQuitDateAutoCalculated: !!(updates.stages && updates.stages.length > 0),
//                     newExpectedQuitDate: updatedPlan.expectedQuitDate
//                 }
//             },
//             message: updates.stages && updates.stages.length > 0 ?
//                 "Cập nhật kế hoạch thành công. Ngày hoàn thành đã được tự động tính toán lại." :
//                 "Cập nhật kế hoạch thành công"
//         };

//     } catch (error) {
//         throw new Error(`Lỗi khi cập nhật kế hoạch: ${error.message}`);
//     }
// };

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

        // CHỈ cho phép cập nhật reason - KHÔNG cho cập nhật expectedQuitDate
        if (updates.reason) {
            plan.reason = updates.reason;
            await plan.save();
        }

        // Xử lý cập nhật stages (nếu có)
        if (updates.stages && updates.stages.length > 0) {
            // THÊM MỚI: Kiểm tra subscription limit cho stages mới
            const totalNewDays = updates.stages.reduce((sum, stage) => sum + (stage.daysToComplete || 0), 0);

            if (totalNewDays > 0) {
                const subscriptionCheck = await checkSubscriptionLimit(userId, totalNewDays);
                if (!subscriptionCheck.isValid) {
                    return {
                        success: false,
                        message: subscriptionCheck.message,
                        data: {
                            remainingDays: subscriptionCheck.remainingDays,
                            requiredDays: subscriptionCheck.requiredDays,
                            excessDays: subscriptionCheck.excessDays
                        }
                    };
                }
            }

            // Sử dụng getCurrentStage để lấy thông tin chi tiết về trạng thái các giai đoạn
            const stageInfo = await getCurrentStage(userId);

            if (!stageInfo.success) {
                return {
                    success: false,
                    message: "Không thể lấy thông tin giai đoạn để validation"
                };
            }

            const { allStagesWithProgress, planInfo } = stageInfo.data;

            // Phân loại stages theo trạng thái từ getCurrentStage
            const completedStages = allStagesWithProgress.filter(stage => stage.status === "completed");
            const currentStage = allStagesWithProgress.find(stage => stage.status === "in_progress");
            const upcomingStages = allStagesWithProgress.filter(stage => stage.status === "upcoming");

            // Validation: kiểm tra xem có cố gắng update stage đã hoàn thành không
            const invalidUpdates = [];
            const stagesToKeep = []; // Các stage đã hoàn thành sẽ được giữ nguyên
            const stagesToUpdate = []; // Các stage có thể cập nhật

            // Giữ nguyên tất cả stages đã hoàn thành
            completedStages.forEach(stage => {
                stagesToKeep.push({
                    _id: stage._id,
                    title: stage.title,
                    description: stage.description,
                    orderNumber: stage.orderNumber,
                    daysToComplete: stage.daysToComplete,
                    reason: "Đã hoàn thành - không thể chỉnh sửa"
                });
            });

            // Kiểm tra các stage trong updates
            updates.stages.forEach(updateStage => {
                // THÊM MỚI: Validation cho từng stage
                if (!updateStage.title || updateStage.title.trim() === "") {
                    invalidUpdates.push({
                        stageId: updateStage._id || "new",
                        title: updateStage.title || "Không có tiêu đề",
                        reason: "Tiêu đề giai đoạn không được để trống"
                    });
                    return;
                }

                if (!updateStage.description || updateStage.description.trim() === "") {
                    invalidUpdates.push({
                        stageId: updateStage._id || "new",
                        title: updateStage.title,
                        reason: "Mô tả giai đoạn không được để trống"
                    });
                    return;
                }

                if (!updateStage.daysToComplete || updateStage.daysToComplete <= 0) {
                    invalidUpdates.push({
                        stageId: updateStage._id || "new",
                        title: updateStage.title,
                        reason: "Số ngày hoàn thành phải lớn hơn 0"
                    });
                    return;
                }

                if (updateStage.daysToComplete > 365) {
                    invalidUpdates.push({
                        stageId: updateStage._id || "new",
                        title: updateStage.title,
                        reason: "Số ngày hoàn thành không được vượt quá 365 ngày"
                    });
                    return;
                }

                if (updateStage._id) {
                    // Update stage có sẵn
                    const existingStage = allStagesWithProgress.find(s => s._id.toString() === updateStage._id.toString());

                    if (existingStage) {
                        if (existingStage.status === "completed") {
                            // Stage đã hoàn thành - không được phép chỉnh sửa
                            invalidUpdates.push({
                                stageId: updateStage._id,
                                title: existingStage.title,
                                reason: "Giai đoạn đã hoàn thành - không thể chỉnh sửa"
                            });
                        } else if (existingStage.status === "in_progress") {
                            // Stage đang thực hiện - chỉ cho phép sửa title và description
                            if (updateStage.daysToComplete && updateStage.daysToComplete !== existingStage.daysToComplete) {
                                invalidUpdates.push({
                                    stageId: updateStage._id,
                                    title: existingStage.title,
                                    reason: "Giai đoạn đang thực hiện - không thể thay đổi số ngày hoàn thành"
                                });
                            } else if (updateStage.orderNumber && updateStage.orderNumber !== existingStage.orderNumber) {
                                invalidUpdates.push({
                                    stageId: updateStage._id,
                                    title: existingStage.title,
                                    reason: "Giai đoạn đang thực hiện - không thể thay đổi thứ tự"
                                });
                            } else {
                                // Cho phép cập nhật title và description cho stage đang thực hiện
                                stagesToUpdate.push({
                                    _id: updateStage._id,
                                    title: updateStage.title || existingStage.title,
                                    description: updateStage.description || existingStage.description,
                                    orderNumber: existingStage.orderNumber, // Giữ nguyên
                                    daysToComplete: existingStage.daysToComplete, // Giữ nguyên
                                    updateType: "limited" // Chỉ cập nhật một phần
                                });
                            }
                        } else {
                            // Stage upcoming - cho phép cập nhật tất cả
                            stagesToUpdate.push({
                                _id: updateStage._id,
                                title: updateStage.title,
                                description: updateStage.description,
                                orderNumber: updateStage.orderNumber,
                                daysToComplete: updateStage.daysToComplete,
                                updateType: "full" // Cập nhật đầy đủ
                            });
                        }
                    }
                } else {
                    // Stage mới - chỉ cho phép thêm vào cuối (order lớn hơn stage cuối cùng)
                    const maxOrder = Math.max(...allStagesWithProgress.map(s => s.orderNumber));
                    if (updateStage.orderNumber && updateStage.orderNumber <= maxOrder) {
                        // Chỉ cho phép thêm stage mới ở cuối
                        const lastCompletedOrder = completedStages.length > 0 ? Math.max(...completedStages.map(s => s.orderNumber)) : 0;
                        const currentOrder = currentStage ? currentStage.orderNumber : 0;

                        if (updateStage.orderNumber <= Math.max(lastCompletedOrder, currentOrder)) {
                            invalidUpdates.push({
                                title: updateStage.title,
                                reason: "Không thể thêm giai đoạn mới vào giữa các giai đoạn đã bắt đầu"
                            });
                        } else {
                            stagesToUpdate.push({
                                title: updateStage.title,
                                description: updateStage.description,
                                orderNumber: updateStage.orderNumber,
                                daysToComplete: updateStage.daysToComplete,
                                updateType: "new"
                            });
                        }
                    } else {
                        // Tự động gán order number
                        stagesToUpdate.push({
                            title: updateStage.title,
                            description: updateStage.description,
                            orderNumber: maxOrder + 1,
                            daysToComplete: updateStage.daysToComplete,
                            updateType: "new"
                        });
                    }
                }
            });

            // Nếu có lỗi validation, trả về lỗi
            if (invalidUpdates.length > 0) {
                return {
                    success: false,
                    message: "Không thể cập nhật một số giai đoạn do vi phạm quy tắc chỉnh sửa",
                    data: {
                        invalidUpdates,
                        validationRules: {
                            completed: "Không được chỉnh sửa giai đoạn đã hoàn thành",
                            in_progress: "Giai đoạn đang thực hiện chỉ được chỉnh sửa tiêu đề và mô tả",
                            upcoming: "Giai đoạn chưa bắt đầu có thể chỉnh sửa tất cả thông tin",
                            new_stages: "Chỉ được thêm giai đoạn mới vào cuối",
                            basic_validation: "Tiêu đề, mô tả và số ngày hợp lệ là bắt buộc"
                        },
                        currentStageInfo: stageInfo.data
                    }
                };
            }

            // Thực hiện cập nhật stages
            if (stagesToUpdate.length > 0) {
                // Xóa các stages có thể cập nhật (không xóa stages đã hoàn thành)
                const stageIdsToDelete = stagesToUpdate
                    .filter(stage => stage._id && stage.updateType !== "new")
                    .map(stage => stage._id);

                if (stageIdsToDelete.length > 0) {
                    await PlanStagesModel.deleteMany({
                        _id: { $in: stageIdsToDelete }
                    });
                }

                // Tạo lại các stages
                const stagePromises = stagesToUpdate.map(stage => {
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

                // Tự động tính toán lại expectedQuitDate dựa trên tổng thời gian stages
                const allStagesAfterUpdate = await PlanStagesModel.find({ quitPlansId: planId })
                    .sort({ orderNumber: 1 });

                const totalStageDays = allStagesAfterUpdate.reduce((sum, stage) => sum + stage.daysToComplete, 0);

                // THÊM MỚI: Kiểm tra lại subscription limit sau khi cập nhật
                const finalSubscriptionCheck = await checkSubscriptionLimit(userId, totalStageDays);
                if (!finalSubscriptionCheck.isValid) {
                    // Rollback nếu vượt quá limit
                    await PlanStagesModel.deleteMany({ quitPlansId: planId });

                    // Khôi phục stages cũ (simplified - trong thực tế có thể cần backup trước)
                    return {
                        success: false,
                        message: `Cập nhật bị hủy: ${finalSubscriptionCheck.message}`,
                        data: {
                            remainingDays: finalSubscriptionCheck.remainingDays,
                            requiredDays: finalSubscriptionCheck.requiredDays,
                            excessDays: finalSubscriptionCheck.excessDays
                        }
                    };
                }

                const newExpectedQuitDate = new Date(plan.startDate);
                newExpectedQuitDate.setDate(newExpectedQuitDate.getDate() + totalStageDays);

                plan.expectedQuitDate = newExpectedQuitDate;
                await plan.save();
            }
        }

        // Lấy kế hoạch đã cập nhật
        const updatedPlan = await QuitPlansModel.findById(planId)
            .populate("userId", "name email");
        const stages = await PlanStagesModel.find({ quitPlansId: planId })
            .sort({ orderNumber: 1 });

        // Sử dụng lại getCurrentStage để lấy thông tin trạng thái mới
        const updatedStageInfo = await getCurrentStage(userId);

        return {
            success: true,
            data: {
                plan: updatedPlan,
                stages: stages,
                stageInfo: updatedStageInfo.success ? updatedStageInfo.data : null,
                updateSummary: {
                    reasonUpdated: !!updates.reason,
                    stagesUpdated: !!(updates.stages && updates.stages.length > 0),
                    totalStages: stages.length,
                    expectedQuitDateAutoCalculated: !!(updates.stages && updates.stages.length > 0),
                    newExpectedQuitDate: updatedPlan.expectedQuitDate
                }
            },
            message: updates.stages && updates.stages.length > 0 ?
                "Cập nhật kế hoạch thành công. Ngày hoàn thành đã được tự động tính toán lại." :
                "Cập nhật kế hoạch thành công"
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

//Tự động hoàn thành các kế hoạch hết hạn
const autoCompleteExpiredPlans = async () => {
    try {
        const now = new Date();

        // Tìm tất cả kế hoạch đã hết hạn nhưng vẫn đang active
        const expiredPlans = await QuitPlansModel.find({
            isActive: true,
            expectedQuitDate: { $lt: now }
        }).populate("userId", "name email");

        if (expiredPlans.length === 0) {
            console.log("✅ Không có kế hoạch nào hết hạn cần tự động hoàn thành");
            return {
                success: true,
                data: {
                    autoCompletedCount: 0,
                    emailsSent: 0
                },
                message: "Không có kế hoạch nào hết hạn cần tự động hoàn thành"
            };
        }

        console.log(`🔍 Tìm thấy ${expiredPlans.length} kế hoạch hết hạn cần tự động hoàn thành`);

        let autoCompletedCount = 0;
        let emailsSent = 0;
        const results = [];

        for (const plan of expiredPlans) {
            try {
                const user = plan.userId;

                // Tính toán thông tin
                const daysPassed = Math.floor((now - plan.startDate) / (1000 * 60 * 60 * 24));
                const totalDays = Math.floor((plan.expectedQuitDate - plan.startDate) / (1000 * 60 * 60 * 24));
                const daysOverdue = Math.floor((now - plan.expectedQuitDate) / (1000 * 60 * 60 * 24));

                // Tự động hoàn thành kế hoạch
                plan.isActive = false;
                plan.completedAt = now;
                plan.completionStatus = "auto_completed"; // Đánh dấu là tự động hoàn thành
                await plan.save();

                autoCompletedCount++;

                // Gửi email thông báo hoàn thành
                if (user && user.email) {
                    const emailSent = await sendCompletionEmail(user, plan, {
                        daysPassed: daysPassed,
                        totalDays: totalDays,
                        daysOverdue: daysOverdue,
                        isAutoCompleted: true
                    });

                    if (emailSent) {
                        emailsSent++;
                    }
                }

                results.push({
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    planId: plan._id,
                    reason: plan.reason,
                    daysPassed: daysPassed,
                    daysOverdue: daysOverdue,
                    completedAt: now
                });

                console.log(`✅ Tự động hoàn thành kế hoạch cho user ${user.name} (quá hạn ${daysOverdue} ngày)`);

            } catch (error) {
                console.error(`❌ Lỗi tự động hoàn thành kế hoạch cho user ${plan.userId.name}:`, error.message);
            }
        }

        const result = {
            success: true,
            data: {
                autoCompletedCount: autoCompletedCount,
                emailsSent: emailsSent,
                totalExpiredPlans: expiredPlans.length,
                completedPlans: results,
                executionTime: now.toLocaleString('vi-VN')
            },
            message: `Đã tự động hoàn thành ${autoCompletedCount}/${expiredPlans.length} kế hoạch hết hạn và gửi ${emailsSent} email thông báo`
        };

        console.log(`📊 Kết quả tự động hoàn thành: ${JSON.stringify(result.data)}`);
        return result;

    } catch (error) {
        console.error("❌ Lỗi khi tự động hoàn thành kế hoạch hết hạn:", error.message);
        throw new Error(`Lỗi khi tự động hoàn thành kế hoạch hết hạn: ${error.message}`);
    }
};

// THÊM MỚI: Gửi email thông báo hoàn thành kế hoạch
const sendCompletionEmail = async (user, plan, completionInfo) => {
    try {
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const { daysPassed, totalDays, daysOverdue, isAutoCompleted } = completionInfo;
        const progressPercentage = Math.min(Math.round((daysPassed / totalDays) * 100), 100);

        let congratsMessage = "";
        let statusMessage = "";

        if (isAutoCompleted) {
            congratsMessage = "🎉 Kế hoạch cai thuốc của bạn đã hoàn thành!";
            statusMessage = `Kế hoạch đã được tự động hoàn thành sau ${daysPassed} ngày (quá hạn ${daysOverdue} ngày so với dự kiến).`;
        } else {
            congratsMessage = "🎉 Chúc mừng! Bạn đã hoàn thành kế hoạch cai thuốc!";
            statusMessage = `Bạn đã hoàn thành kế hoạch sau ${daysPassed} ngày.`;
        }

        const emailHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #28a745; margin: 0;">${congratsMessage}</h2>
                <p style="color: #6c757d; font-size: 14px;">Chào ${user.name}, chúc mừng bạn đã hoàn thành hành trình cai thuốc!</p>
            </div>

            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
                <h3 style="color: #28a745; margin: 10px 0;">HOÀN THÀNH!</h3>
                <p style="font-size: 16px; color: #495057; margin: 0;">${statusMessage}</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #007bff; margin-top: 0;">📋 Thông tin kế hoạch</h3>
                <p style="margin: 8px 0;"><strong>Lý do cai thuốc:</strong> ${plan.reason}</p>
                <p style="margin: 8px 0;"><strong>Ngày bắt đầu:</strong> ${plan.startDate.toLocaleDateString('vi-VN')}</p>
                <p style="margin: 8px 0;"><strong>Ngày dự kiến:</strong> ${plan.expectedQuitDate.toLocaleDateString('vi-VN')}</p>
                <p style="margin: 8px 0;"><strong>Ngày hoàn thành:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #28a745; margin-top: 0;">📊 Thống kê hành trình</h3>
                <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #007bff;">${daysPassed}</div>
                        <div style="font-size: 12px; color: #6c757d;">Ngày đã trải qua</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #28a745;">${progressPercentage}%</div>
                        <div style="font-size: 12px; color: #6c757d;">Tiến độ hoàn thành</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #ffc107;">${totalDays}</div>
                        <div style="font-size: 12px; color: #6c757d;">Ngày dự kiến</div>
                    </div>
                </div>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #155724; margin-top: 0;">🌟 Chúc mừng thành tích của bạn!</h4>
                <p style="color: #155724; margin-bottom: 15px;">Bạn đã vượt qua được một trong những thách thức lớn nhất - cai thuốc lá. Đây là một bước quan trọng cho sức khỏe và tương lai của bạn.</p>
                
                <h5 style="color: #155724; margin: 15px 0 10px 0;">💪 Để duy trì thành quả:</h5>
                <ul style="color: #155724; margin: 0; padding-left: 20px;">
                    <li>Tiếp tục tránh xa thuốc lá và môi trường có khói thuốc</li>
                    <li>Duy trì lối sống lành mạnh với chế độ ăn uống cân bằng</li>
                    <li>Tập thể dục thường xuyên để giảm stress</li>
                    <li>Tự thưởng cho bản thân những thành tựu đã đạt được</li>
                </ul>
            </div>

            ${isAutoCompleted ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">📅 Tạo kế hoạch mới</h4>
                <p style="color: #856404; margin: 0;">Nếu bạn muốn tiếp tục với mục tiêu cai thuốc hoàn toàn hoặc thiết lập thói quen mới, hãy tạo kế hoạch mới ngay hôm nay!</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/quit-plans" 
                   style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">
                    🎯 Tạo kế hoạch mới
                </a>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/progress-logs" 
                   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    📊 Xem thống kê
                </a>
            </div>

            <hr style="border: 0.5px solid #ddd; margin: 20px 0;">
            
            <div style="text-align: center;">
                <p style="font-size: 12px; color: #6c757d; margin: 5px 0;">
                    Cảm ơn bạn đã tin tưởng và sử dụng ứng dụng cai thuốc của chúng tôi!
                </p>
                <p style="font-size: 12px; color: #6c757d; margin: 0;">
                    &copy; 2025 Ứng dụng cai thuốc. Chúc bạn luôn khỏe mạnh!
                </p>
            </div>
        </div>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: `🎉 ${isAutoCompleted ? 'Kế hoạch cai thuốc đã hoàn thành!' : 'Chúc mừng hoàn thành kế hoạch cai thuốc!'} - ${daysPassed} ngày thành công`,
            html: emailHTML,
        });

        console.log(`✅ Đã gửi email hoàn thành cho ${user.name} (${user.email})`);
        return true;

    } catch (error) {
        console.error(`❌ Lỗi gửi email hoàn thành cho ${user.email}:`, error.message);
        return false;
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
                stageIndex: index + 1, // Chỉ số giai đoạn (bắt đầu từ 1)
                stageStartDay: stageStart, // Ngày bắt đầu giai đoạn
                stageEndDay: stageEnd - 1, // Ngày kết thúc giai đoạn (inclusive)
                status: stageStatus, // Trạng thái giai đoạn
                daysCompleted: stageDaysCompleted, // Số ngày đã hoàn thành trong giai đoạn
                remainingDays: stage.daysToComplete - stageDaysCompleted, // Số ngày còn lại trong giai đoạn
                progressPercentage: stageProgressPercent // Tiến độ giai đoạn (0-100%)
            };
        });

        // Lấy thông tin các giai đoạn theo trạng thái
        const previousStages = stagesWithProgress.filter(stage => stage.status === "completed");
        const nextStages = stagesWithProgress.filter(stage => stage.status === "upcoming");

        return {
            success: true,
            data: {
                currentStage: currentStage, // Giai đoạn hiện tại
                previousStages: previousStages,//Giai đoạn đã hoàn thành
                nextStages: nextStages, //Giai đoạn sắp tới
                allStagesWithProgress: stagesWithProgress, // Thêm thông tin tất cả stages
                planInfo: {
                    planId: currentPlan._id, // ID của kế hoạch
                    reason: currentPlan.reason,// Lý do cai thuốc
                    startDate: currentPlan.startDate, // Ngày bắt đầu kế hoạch
                    expectedQuitDate: currentPlan.expectedQuitDate,// Ngày dự kiến hoàn thành
                    daysPassed: daysPassed, // Số ngày đã qua kể từ khi bắt đầu kế hoạch
                    totalDays: totalDays, // Tổng số ngày của kế hoạch
                    remainingDays: Math.max(0, totalDays - daysPassed), // Số ngày còn lại
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
    getStageById,
    autoCompleteExpiredPlans,
    sendCompletionEmail
};