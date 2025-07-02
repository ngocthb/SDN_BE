const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const ratingRoutes = require("./ratingRoutes");
const feedbackRoutes = require("./feedbackRoutes");

const adminRatingRoutes = require("./adminRatingRoutes");
const adminFeedbackRoutes = require("./adminFeedbackRoutes");
const adminUserRoutes = require("./AdminUserRoutes");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
  app.use("/api/ratings", ratingRoutes);
  app.use("/api/feedback", feedbackRoutes);

  app.use("/api/admin/ratings", adminRatingRoutes);
  app.use("/api/admin/feedback", adminFeedbackRoutes);
  app.use("/api/admin/users", adminUserRoutes);
};

module.exports = routes;
