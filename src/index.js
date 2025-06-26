const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes");
const { startDailyReminderCron, startDailySummaryCron, startTestReminderCron, startAutoCompleteCron } = require("./services/CronService");

dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

startDailyReminderCron();    // Gửi email lúc 17:00
// startTestReminderCron();
startDailySummaryCron();     // Báo cáo lúc 17:30
startAutoCompleteCron(); // Tự động hoàn thành kế hoạch hết hạn lúc 8:00 sáng

routes(app);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
