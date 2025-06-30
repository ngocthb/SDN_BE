const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const asyncHandler = require("express-async-handler");
// middleware dịch token sang thông tin người dùng
const authUserMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Oops! You need to log in to use this feature",
        status: "ERR",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Oops! Your session has expired. Please log in again.",
          status: "ERR",
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "ERR" });
  }
};

const authAdminMiddleware = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      message: "You do not have permission to access this resource",
      status: "ERR",
    });
  }
};

const authCoachMiddleware = (req, res, next) => {
  if (req.user.isCoach) {
    next();
  } else {
    return res.status(403).json({
      message: "You do not have permission to access this resource",
      status: "ERR",
    });
  }
};

const authCoachOrAdminMiddleware = (req, res, next) => {
  if (req.user.isCoach || req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      status: "ERR",
      message: "You do not have permission to access this resource",
    });
  }
};

module.exports = {
  authUserMiddleware,
  authAdminMiddleware,
  authCoachMiddleware,
  authCoachOrAdminMiddleware
};
