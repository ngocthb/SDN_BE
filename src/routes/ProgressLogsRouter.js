const express = require("express");
const routerProgressLogs = express.Router();
const ProgressLogsController = require("../controller/ProgressLogsController");
const {
    authUserMiddleware,
} = require("../middleware/authMiddleware");

// Tất cả routes đều cần authentication
routerProgressLogs.use(authUserMiddleware);

// Ghi nhận tiến trình hàng ngày
routerProgressLogs.post("/", ProgressLogsController.logDailyProgress);

// Lấy tiến trình hôm nay
routerProgressLogs.get("/today", ProgressLogsController.getTodayProgress);

// Lấy thống kê tổng quan
routerProgressLogs.get("/statistics", ProgressLogsController.getProgressStatistics);

// Lấy biểu đồ tiến trình
routerProgressLogs.get("/chart", ProgressLogsController.getProgressChart);

// Lấy danh sách tiến trình
routerProgressLogs.get("/", ProgressLogsController.getProgressLogs);

// Xóa log tiến trình
routerProgressLogs.delete("/:logId", ProgressLogsController.deleteProgressLog);

module.exports = routerProgressLogs;