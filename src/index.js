const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = require("./routes");

const { startDailyReminderCron, startDailySummaryCron, startTestReminderCron, startAutoCompleteCron, startSubscriptionExpirationCron, startSubscriptionMaintenanceCron } = require("./services/CronService");

const setupSocket = require("./config/socket");

const http = require("http");


dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

startDailyReminderCron();    // Gửi email lúc 17:00
// startTestReminderCron();
startDailySummaryCron();     // Báo cáo lúc 17:30

startAutoCompleteCron(); // Tự động hoàn thành kế hoạch hết hạn lúc 8:00 sáng

startSubscriptionExpirationCron(); // Kiểm tra subscription sắp hết hạn và gửi email cảnh báo lúc 9:00 sáng

startSubscriptionMaintenanceCron(); // Cập nhật subscription hết hạn lúc 7:00 sáng

routes(app);

// Tạo server HTTP
const server = http.createServer(app);

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(`📚 Swagger Docs: http://localhost:${port}/api-docs`);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    credentials: true, // ✅ BẮT BUỘC phải có dòng này
  },
});

setupSocket(io);

// Bắt đầu server
server.listen(port, "0.0.0.0", () => {
  console.log("🚀 Server is running on port " + port);
});
