const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
};

module.exports = routes;
