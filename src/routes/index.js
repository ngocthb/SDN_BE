const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const ratingRoutes = require("./ratingRoutes");
const feedbackRoutes = require("./feedbackRoutes");

const adminRatingRoutes = require("./adminRatingRoutes");
const adminFeedbackRoutes = require("./adminFeedbackRoutes");
const adminUserRoutes = require("./AdminUserRoutes");
const ChatRouter = require("./ChatRouter");
const CoachRouter = require("./CoachRouter");
const SubscriptionRouter = require("./SubscriptionRouter");
const SmokingSatusRouter = require("./SmokingStatusRouter");
const QuitPlansRouter = require("./QuitPlansRouter");
const ProgressLogsRouter = require("./ProgressLogsRouter");

const BlogRouter = require("./BlogRouter");
const CommentRouter = require("./CommentRouter");
const PayMembershipRouter = require("./PayMembershipRouter");
const AchievementRouter = require("./AchievementRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);

  app.use("/api/ratings", ratingRoutes);
  app.use("/api/feedback", feedbackRoutes);

  app.use("/api/admin/ratings", adminRatingRoutes);
  app.use("/api/admin/feedback", adminFeedbackRoutes);
  app.use("/api/admin/users", adminUserRoutes);
};

  app.use("/api/subscription", SubscriptionRouter);
  app.use("/api/smoking-status", SmokingSatusRouter);
  app.use("/api/quit-plans", QuitPlansRouter);
  app.use("/api/progress-logs", ProgressLogsRouter);
  app.use("/api/coach", CoachRouter);
  app.use("/api/chat", ChatRouter);
  app.use("/api/blog", BlogRouter);
  app.use("/api/comment", CommentRouter);
  app.use("/api/payMembership", PayMembershipRouter);
  app.use("/api/achievement", AchievementRouter);
};

module.exports = routes;
