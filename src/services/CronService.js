const cron = require("node-cron");
const ReminderService = require("../services/ReminderService");

// Chạy hàng ngày lúc 17:00 (5h chiều) cho tất cả users chưa ghi nhận
const startDailyReminderCron = () => {
    // Cron pattern: "0 0 17 * * *" = 17:00 hàng ngày
    cron.schedule("0 0 17 * * *", async () => {
        console.log("🕐 Bắt đầu chạy cron job gửi email nhắc nhở hàng ngày...");

        const result = await ReminderService.sendRemindersToAllUnloggedUsers();

        if (result.success) {
            console.log(`✅ Hoàn thành gửi email: ${result.data.emailsSent} email đã gửi`);
        } else {
            console.error(`❌ Lỗi gửi email: ${result.message}`);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh" // Múi giờ Việt Nam
    });

    console.log("✅ Đã khởi tạo cron job gửi email nhắc nhở hàng ngày lúc 17:00");
};

// Test cron job (chạy mỗi 2 phút để test)
const startTestReminderCron = () => {
    cron.schedule("0 */2 * * * *", async () => {
        console.log("🧪 Test cron job - gửi email nhắc nhở...");

        const result = await ReminderService.sendRemindersToAllUnloggedUsers();

        if (result.success) {
            console.log(`🧪 Test kết quả: ${result.data.emailsSent} email đã gửi`);
        } else {
            console.error(`🧪 Test lỗi: ${result.message}`);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log("🧪 Đã khởi tạo test cron job (chạy mỗi 2 phút)");
};

// Cron job chạy hàng ngày lúc 17:30 để gửi báo cáo tổng kết
const startDailySummaryCron = () => {
    cron.schedule("0 30 17 * * *", async () => {
        console.log("📊 Tạo báo cáo tổng kết ngày...");
        // Có thể thêm logic tạo báo cáo tổng kết ở đây
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log("📊 Đã khởi tạo cron job báo cáo tổng kết lúc 17:30");
};

module.exports = {
    startDailyReminderCron,
    startTestReminderCron,
    startDailySummaryCron
};