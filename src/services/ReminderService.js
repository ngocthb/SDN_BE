const nodemailer = require("nodemailer");
const QuitPlansModel = require("../models/QuitPlansModel");
const ProgressLogsModel = require("../models/ProgressLogsModel");
const UserModel = require("../models/UserModel");
const cron = require("node-cron");

const dotenv = require("dotenv");
dotenv.config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Gửi email nhắc nhở cho 1 user
const sendReminderEmail = async (user, quitPlan) => {
    try {
        // Tính toán tiến độ
        const now = new Date();
        const daysPassed = Math.floor((now - quitPlan.startDate) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((quitPlan.expectedQuitDate - quitPlan.startDate) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, totalDays - daysPassed);
        const progressPercentage = Math.min(Math.round((daysPassed / totalDays) * 100), 100);

        const emailHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #28a745; margin: 0;">🌟 Nhắc nhở ghi nhận tiến trình cai thuốc</h2>
                <p style="color: #6c757d; font-size: 14px;">Chào ${user.name}, đã đến lúc ghi nhận tiến trình hôm nay!</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #007bff; margin-top: 0;">📋 Kế hoạch cai thuốc của bạn</h3>
                <p style="font-size: 16px; margin: 10px 0;"><strong>Lý do cai thuốc:</strong> ${quitPlan.reason}</p>
                <p style="font-size: 14px; color: #6c757d; margin: 5px 0;">Bắt đầu: ${quitPlan.startDate.toLocaleDateString('vi-VN')}</p>
                <p style="font-size: 14px; color: #6c757d; margin: 5px 0;">Dự kiến hoàn thành: ${quitPlan.expectedQuitDate.toLocaleDateString('vi-VN')}</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #28a745; margin-top: 0;">📊 Tiến trình hiện tại</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #007bff;">${daysPassed}</div>
                        <div style="font-size: 12px; color: #6c757d;">Ngày đã trải qua</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #28a745;">${progressPercentage}%</div>
                        <div style="font-size: 12px; color: #6c757d;">Tiến độ</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${remainingDays}</div>
                        <div style="font-size: 12px; color: #6c757d;">Ngày còn lại</div>
                    </div>
                </div>
                
                <div style="background-color: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background-color: #28a745; height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
                </div>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #856404; margin-top: 0;">⏰ Đã đến lúc ghi nhận tiến trình hôm nay!</h4>
                <p style="color: #856404; margin-bottom: 10px;">Hãy dành 2 phút để ghi lại:</p>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                    <li>Số điếu thuốc đã hút hôm nay</li>
                    <li>Tình trạng sức khỏe hiện tại</li>
                    <li>Tâm trạng và cảm xúc</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/progress-logs" 
                   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    📝 Ghi nhận tiến trình ngay
                </a>
            </div>

            <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #28a745; margin-top: 0;">💪 Lời động viên</h4>
                <p style="color: #495057; margin: 0; font-style: italic;">
                    "${getMotivationalQuote(daysPassed, progressPercentage)}"
                </p>
            </div>

            <hr style="border: 0.5px solid #ddd; margin: 20px 0;">
            
            <div style="text-align: center;">
                <p style="font-size: 12px; color: #6c757d; margin: 0;">
                    &copy; 2025 Ứng dụng cai thuốc. Chúc bạn thành công!
                </p>
            </div>
        </div>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: `🌟 [${progressPercentage}%] Nhắc nhở ghi nhận tiến trình cai thuốc - Ngày ${daysPassed}`,
            html: emailHTML,
        });

        console.log(`✅ Đã gửi email cho ${user.name} (${user.email})`);
        return true;

    } catch (error) {
        console.error(`❌ Lỗi gửi email cho ${user.email}:`, error.message);
        return false;
    }
};

// Hàm lấy câu động viên
const getMotivationalQuote = (daysPassed, progressPercentage) => {
    if (progressPercentage >= 80) {
        return "Tuyệt vời! Bạn gần như đã hoàn thành mục tiêu rồi. Đừng dừng lại khi đã gần đến đích!";
    } else if (progressPercentage >= 50) {
        return "Xuất sắc! Bạn đã vượt qua được nửa chặng đường. Phần khó khăn nhất đã qua rồi!";
    } else if (daysPassed >= 7) {
        return "Bạn đã trải qua tuần đầu khó khăn nhất! Cơ thể bạn đang dần thích nghi với cuộc sống không thuốc lá.";
    } else {
        const quotes = [
            "Mỗi ngày không hút thuốc là một chiến thắng! Bạn đang làm rất tốt!",
            "Hành trình nghìn dặm bắt đầu từ một bước chân. Bạn đã đi được rất xa rồi!",
            "Sức khỏe của bạn đang cải thiện từng ngày. Hãy tiếp tục!",
            "Bạn mạnh mẽ hơn cơn thèm thuốc. Đừng bỏ cuộc!",
            "Mỗi điếu thuốc bạn không hút là món quà cho tương lai của chính bạn."
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
};

// Gửi email cho tất cả users chưa ghi nhận tiến trình
const sendRemindersToAllUnloggedUsers = async () => {
    try {
        console.log(`🕐 [${new Date().toLocaleString('vi-VN')}] Bắt đầu kiểm tra và gửi email nhắc nhở...`);

        // Lấy tất cả kế hoạch đang active
        const activePlans = await QuitPlansModel.find({ isActive: true })
            .populate("userId", "name email");

        if (activePlans.length === 0) {
            console.log("📭 Không có kế hoạch nào đang active");
            return {
                success: true,
                data: {
                    totalActivePlans: 0,
                    emailsSent: 0,
                    alreadyLogged: 0,
                    errors: 0
                },
                message: "Không có kế hoạch nào đang active"
            };
        }

        console.log(`📋 Tìm thấy ${activePlans.length} kế hoạch đang active`);

        // Lấy ngày hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let emailsSent = 0;
        let alreadyLogged = 0;
        let errors = 0;

        // Lấy tất cả logs hôm nay một lần để tối ưu
        const todayLogs = await ProgressLogsModel.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Tạo Map để tra cứu nhanh
        const loggedUserIds = new Set(todayLogs.map(log => log.userId.toString()));

        // Xử lý từng kế hoạch
        for (const plan of activePlans) {
            const user = plan.userId;

            // Kiểm tra user có email không
            if (!user || !user.email) {
                console.log(`⚠️ User ${user?.name || 'Unknown'} không có email`);
                errors++;
                continue;
            }

            // Kiểm tra user đã ghi nhận tiến trình hôm nay chưa
            if (loggedUserIds.has(user._id.toString())) {
                console.log(`✅ User ${user.name} đã ghi nhận tiến trình hôm nay`);
                alreadyLogged++;
                continue;
            }

            // Gửi email nhắc nhở
            console.log(`📧 Gửi email cho ${user.name}...`);
            const sent = await sendReminderEmail(user, plan);

            if (sent) {
                emailsSent++;
            } else {
                errors++;
            }

            // Delay nhỏ để tránh spam email server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const result = {
            success: true,
            data: {
                totalActivePlans: activePlans.length,
                emailsSent: emailsSent,
                alreadyLogged: alreadyLogged,
                errors: errors,
                executionTime: new Date().toLocaleString('vi-VN')
            },
            message: `Hoàn thành gửi email nhắc nhở: ${emailsSent} email đã gửi, ${alreadyLogged} đã ghi nhận, ${errors} lỗi`
        };

        console.log(`📊 Kết quả: ${JSON.stringify(result.data)}`);
        return result;

    } catch (error) {
        console.error("❌ Lỗi khi gửi email nhắc nhở:", error.message);
        return {
            success: false,
            message: error.message
        };
    }
};

// Gửi email cho user cụ thể (để test)
const sendReminderToSpecificUser = async (userId) => {
    try {
        const plan = await QuitPlansModel.findOne({
            userId: userId,
            isActive: true
        }).populate("userId", "name email");

        if (!plan) {
            return {
                success: false,
                message: "Người dùng không có kế hoạch active"
            };
        }

        // Kiểm tra đã ghi nhận tiến trình hôm nay chưa
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayLog = await ProgressLogsModel.findOne({
            userId: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (todayLog) {
            return {
                success: false,
                message: "Người dùng đã ghi nhận tiến trình hôm nay"
            };
        }

        const sent = await sendReminderEmail(plan.userId, plan);

        return {
            success: sent,
            message: sent ? "Gửi email nhắc nhở thành công" : "Gửi email thất bại"
        };

    } catch (error) {
        throw new Error(`Lỗi khi gửi email nhắc nhở: ${error.message}`);
    }
};

module.exports = {
    sendRemindersToAllUnloggedUsers,
    sendReminderToSpecificUser,
    sendReminderEmail
};