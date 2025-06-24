const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");

const SubscriptionRouter = require("./SubscriptionRouter");
const SmokingSatusRouter = require("./SmokingStatusRouter");
const QuitPlansRouter = require("./QuitPlansRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
  app.use("/api/subscription", SubscriptionRouter);
  app.use("/api/smoking-status", SmokingSatusRouter);
  app.use("/api/quit-plans", QuitPlansRouter);
}

module.exports = routes;
