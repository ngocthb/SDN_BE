const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const ChatRouter = require("./ChatRouter");
const CoachRouter = require("./CoachRouter");
const SubscriptionRouter = require("./SubscriptionRouter");
const SmokingSatusRouter = require("./SmokingStatusRouter");
const QuitPlansRouter = require("./QuitPlansRouter");
const ProgressLogsRouter = require("./ProgressLogsRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
  app.use("/api/subscription", SubscriptionRouter);
  app.use("/api/smoking-status", SmokingSatusRouter);
  app.use("/api/quit-plans", QuitPlansRouter);
  app.use("/api/progress-logs", ProgressLogsRouter);
  app.use("/api/coach", CoachRouter);
  app.use("/api/chat", ChatRouter);
}

module.exports = routes;
