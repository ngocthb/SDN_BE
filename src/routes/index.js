const UserRouter = require("./UserRouter");
const ClaimRouter = require("./ClaimRouter");
const ProjectRouter = require("./ProjectRouter");
const AuthRouter = require("./AuthRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/claim", ClaimRouter);
  app.use("/api/project", ProjectRouter);
  app.use("/api/auth", AuthRouter);
};

module.exports = routes;
