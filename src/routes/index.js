const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const MembershipRouter = require("./MembershipRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
  app.use("/api/membership", MembershipRouter);
};

module.exports = routes;
