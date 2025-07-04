const SubscriptionModel = require("../models/SubscriptionsModel");
const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");

// Cấu hình email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendExpirationWarningEmail = async (user, subscription) => {
    const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "⚠️ Gói đăng ký của bạn sắp hết hạn",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff6b35;">Thông báo gói đăng ký sắp hết hạn</h2>
                <p>Xin chào <strong>${user.fullName || user.email}</strong>,</p>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">⚠️ Cảnh báo hết hạn</h3>
                    <p style="margin: 0;">Gói đăng ký <strong>${subscription.membershipId.name}</strong> của bạn sẽ hết hạn trong <strong>${daysRemaining} ngày</strong>.</p>
                    <p style="margin: 5px 0 0 0;"><strong>Ngày hết hạn:</strong> ${new Date(subscription.endDate).toLocaleDateString('vi-VN')}</p>
                </div>

                <p>Để tiếp tục sử dụng dịch vụ mà không bị gián đoạn, vui lòng gia hạn gói đăng ký của bạn.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/membership" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Gia hạn ngay
                    </a>
                </div>

                <p style="color: #666; font-size: 14px;">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Email này được gửi tự động. Vui lòng không trả lời email này.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error(`Lỗi gửi email cho ${user.email}:`, error);
        return { success: false, error: error.message };
    }
};

const checkAndSendExpirationWarnings = async () => {
    try {
        // Tính toán ngày sau 3 ngày từ hiện tại
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999); // Cuối ngày

        const startOfThreeDaysFromNow = new Date(threeDaysFromNow);
        startOfThreeDaysFromNow.setHours(0, 0, 0, 0); // Đầu ngày

        // Tìm các subscription active sẽ hết hạn trong 3 ngày
        const expiringSubscriptions = await SubscriptionModel.find({
            status: "active",
            endDate: {
                $gte: startOfThreeDaysFromNow,
                $lte: threeDaysFromNow
            }
        }).populate("userId membershipId");

        console.log(`🔍 Tìm thấy ${expiringSubscriptions.length} subscription sắp hết hạn trong 3 ngày`);

        let emailsSent = 0;
        let emailsFailed = 0;

        for (const subscription of expiringSubscriptions) {
            if (!subscription.userId || !subscription.userId.email) {
                console.log(`⚠️ Bỏ qua subscription ${subscription._id} - thiếu thông tin user`);
                continue;
            }

            // Kiểm tra xem đã gửi email cảnh báo cho subscription này chưa
            // Có thể thêm field lastWarningEmailSent vào model để tránh spam
            const result = await sendExpirationWarningEmail(subscription.userId, subscription);

            if (result.success) {
                emailsSent++;
                console.log(`✅ Đã gửi email cảnh báo cho ${subscription.userId.email}`);

                // Có thể cập nhật field để đánh dấu đã gửi email
                // await SubscriptionModel.findByIdAndUpdate(subscription._id, {
                //     lastWarningEmailSent: new Date()
                // });
            } else {
                emailsFailed++;
                console.error(`❌ Gửi email thất bại cho ${subscription.userId.email}`);
            }
        }

        return {
            success: true,
            data: {
                subscriptionsChecked: expiringSubscriptions.length,
                emailsSent,
                emailsFailed
            }
        };

    } catch (error) {
        console.error("Lỗi kiểm tra subscription sắp hết hạn:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = {
    checkAndSendExpirationWarnings
};