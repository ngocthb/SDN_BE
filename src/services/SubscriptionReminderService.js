const SubscriptionModel = require("../models/SubscriptionsModel");
const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config();

// Cấu hình email transporter - SỬA THEO ReminderService
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendExpirationWarningEmail = async (user, subscription) => {
    const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    const emailHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #ffc107; margin: 0;">⏰ Thông báo gói đăng ký sắp hết hạn</h2>
                <p style="color: #6c757d; font-size: 14px;">Chào ${user.name || user.email}, gói đăng ký của bạn sắp hết hạn!</p>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #856404; margin-top: 0;">⚠️ Cảnh báo hết hạn</h3>
                <p style="color: #856404; font-size: 16px; margin: 0;">
                    Gói đăng ký <strong>${subscription.membershipId.name}</strong> của bạn sẽ hết hạn trong <strong>${daysRemaining} ngày</strong>.
                </p>
                <p style="margin: 5px 0 0 0; color: #856404;"><strong>Ngày hết hạn:</strong> ${new Date(subscription.endDate).toLocaleDateString('vi-VN')}</p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #007bff; margin-top: 0;">📋 Thông tin gói hiện tại</h3>
                <div style="border-left: 4px solid #007bff; padding-left: 15px;">
                    <p style="font-size: 16px; margin: 5px 0;"><strong>Gói:</strong> ${subscription.membershipId.name}</p>
                    <p style="font-size: 14px; margin: 5px 0; color: #6c757d;"><strong>Mô tả:</strong> ${subscription.membershipId.description || 'Không có mô tả'}</p>
                    <p style="font-size: 14px; margin: 5px 0; color: #6c757d;"><strong>Giá:</strong> ${subscription.membershipId.price?.toLocaleString('vi-VN') || 'N/A'} VND</p>
                    <p style="font-size: 14px; margin: 5px 0; color: #6c757d;"><strong>Thời hạn:</strong> ${subscription.membershipId.duration || 'N/A'} ngày</p>
                </div>
            </div>

            <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #0056b3; margin-top: 0;">🎯 Lợi ích khi gia hạn</h4>
                <ul style="color: #0056b3; margin: 0; padding-left: 20px;">
                    <li>Tiếp tục sử dụng đầy đủ tính năng premium</li>
                    <li>Không bị gián đoạn quá trình cai thuốc</li>
                    <li>Nhận hỗ trợ ưu tiên từ đội ngũ chuyên gia</li>
                    <li>Truy cập báo cáo tiến trình chi tiết</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription/renew" 
                   style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">
                    💳 Gia hạn ngay
                </a>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/membership/packages" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    📦 Xem các gói khác
                </a>
            </div>

            <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #6c757d; margin-top: 0;">💡 Lưu ý quan trọng</h4>
                <p style="color: #495057; margin: 0; font-size: 14px;">
                    Để đảm bảo không bị gián đoạn dịch vụ, chúng tôi khuyến nghị bạn gia hạn trước ít nhất 2-3 ngày.
                    Sau khi gói hết hạn, bạn sẽ chỉ có thể sử dụng tính năng cơ bản.
                </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <div style="text-align: center;">
                <p style="color: #6c757d; font-size: 12px; margin: 0;">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline hỗ trợ.
                </p>
                <p style="color: #6c757d; font-size: 12px; margin: 5px 0 0 0;">
                    &copy; 2025 Ứng dụng cai thuốc. Cảm ơn bạn đã tin tưởng!
                </p>
                <p style="color: #999; font-size: 10px; margin: 5px 0 0 0;">
                    Email này được gửi tự động. Vui lòng không trả lời email này.
                </p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.SMTP_USER, // SỬA: dùng SMTP_USER thay vì EMAIL_USER
        to: user.email,
        subject: `⚠️ Gói đăng ký hết hạn trong ${daysRemaining} ngày`,
        html: emailHTML,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi email cảnh báo cho ${user.name || user.email} (${user.email})`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Lỗi gửi email cho ${user.email}:`, error.message);
        return { success: false, error: error.message };
    }
};

const checkAndSendExpirationWarnings = async () => {
    try {
        console.log(`🕐 [${new Date().toLocaleString('vi-VN')}] Bắt đầu kiểm tra subscription sắp hết hạn trong 3 ngày...`);

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
        })
            .populate("userId", "name email") // SỬA: chỉ lấy fields cần thiết
            .populate("membershipId", "name price duration description");

        console.log(`🔍 Tìm thấy ${expiringSubscriptions.length} subscription sắp hết hạn trong 3 ngày`);

        if (expiringSubscriptions.length === 0) {
            return {
                success: true,
                data: {
                    subscriptionsChecked: 0,
                    emailsSent: 0,
                    emailsFailed: 0,
                    executionTime: new Date().toLocaleString('vi-VN')
                },
                message: "Không có subscription nào sắp hết hạn trong 3 ngày"
            };
        }

        let emailsSent = 0;
        let emailsFailed = 0;

        for (const subscription of expiringSubscriptions) {
            if (!subscription.userId || !subscription.userId.email) {
                console.log(`⚠️ Bỏ qua subscription ${subscription._id} - thiếu thông tin user`);
                emailsFailed++;
                continue;
            }

            // Gửi email cảnh báo
            console.log(`📧 Đang gửi email cho ${subscription.userId.name || subscription.userId.email}...`);
            const result = await sendExpirationWarningEmail(subscription.userId, subscription);

            if (result.success) {
                emailsSent++;
            } else {
                emailsFailed++;
            }

            // Delay để tránh spam email server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const result = {
            success: true,
            data: {
                subscriptionsChecked: expiringSubscriptions.length,
                emailsSent,
                emailsFailed,
                executionTime: new Date().toLocaleString('vi-VN')
            },
            message: `Hoàn thành gửi cảnh báo hết hạn: ${emailsSent} email đã gửi, ${emailsFailed} email thất bại`
        };

        console.log(`📊 Kết quả gửi cảnh báo subscription: ${JSON.stringify(result.data)}`);
        return result;

    } catch (error) {
        console.error("❌ Lỗi kiểm tra subscription sắp hết hạn:", error.message);
        return {
            success: false,
            message: error.message
        };
    }
};

const updateExpiredSubscriptions = async () => {
    try {
        console.log(`🕐 [${new Date().toLocaleString('vi-VN')}] Bắt đầu kiểm tra và cập nhật subscription hết hạn...`);

        const now = new Date();

        // Tìm tất cả subscription có status "active" nhưng đã hết hạn
        const expiredSubscriptions = await SubscriptionModel.find({
            status: "active",
            endDate: { $lt: now } // endDate < hiện tại
        }).populate("userId", "name email")
            .populate("membershipId", "name price duration");

        console.log(`🔍 Tìm thấy ${expiredSubscriptions.length} subscription đã hết hạn nhưng chưa cập nhật trạng thái`);

        if (expiredSubscriptions.length === 0) {
            return {
                success: true,
                data: {
                    totalChecked: 0,
                    updatedCount: 0,
                    executionTime: new Date().toLocaleString('vi-VN')
                },
                message: "Không có subscription nào cần cập nhật trạng thái"
            };
        }

        let updatedCount = 0;
        let updateErrors = 0;

        // Cập nhật từng subscription
        for (const subscription of expiredSubscriptions) {
            try {
                const expiredDays = Math.floor((now - new Date(subscription.endDate)) / (1000 * 60 * 60 * 24));

                await SubscriptionModel.findByIdAndUpdate(subscription._id, {
                    status: "expired"
                });

                updatedCount++;

                console.log(`✅ Đã cập nhật subscription ${subscription._id} của user ${subscription.userId.name || subscription.userId.email} - hết hạn ${expiredDays} ngày`);

            } catch (updateError) {
                updateErrors++;
                console.error(`❌ Lỗi cập nhật subscription ${subscription._id}:`, updateError.message);
            }
        }

        const result = {
            success: true,
            data: {
                totalChecked: expiredSubscriptions.length,
                updatedCount,
                updateErrors,
                executionTime: new Date().toLocaleString('vi-VN'),
                expiredSubscriptions: expiredSubscriptions.map(sub => ({
                    subscriptionId: sub._id,
                    userId: sub.userId._id,
                    userEmail: sub.userId.email,
                    membershipName: sub.membershipId.name,
                    endDate: sub.endDate,
                    expiredDays: Math.floor((now - new Date(sub.endDate)) / (1000 * 60 * 60 * 24))
                }))
            },
            message: `Hoàn thành cập nhật subscription hết hạn: ${updatedCount} đã cập nhật, ${updateErrors} lỗi`
        };

        console.log(`📊 Kết quả cập nhật subscription hết hạn: ${updatedCount}/${expiredSubscriptions.length} thành công`);
        return result;

    } catch (error) {
        console.error("❌ Lỗi kiểm tra và cập nhật subscription hết hạn:", error.message);
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = {
    checkAndSendExpirationWarnings,
    updateExpiredSubscriptions,
};