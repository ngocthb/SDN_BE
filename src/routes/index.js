const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const ChatRouter = require("./ChatRouter");
const CoachRouter = require("./CoachRouter");
const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/auth", AuthRouter);
  app.use("/api/coach", CoachRouter);
  app.use("/api/chat", ChatRouter);
};

module.exports = routes;
