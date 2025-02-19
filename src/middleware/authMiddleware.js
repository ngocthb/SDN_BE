const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const UserModel = require("../models/UserModel");

const authAdminMiddleware = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res
        .status(404)
        .json({ message: "Token is not valid", status: "ERR" });
    }
    const userData = await UserModel.findOne({ _id: user.id }).populate(
      "role_id",
      "name"
    );

    if (userData?.role_id?.name === "Administrator") {
      next();
    } else {
      return res
        .status(404)
        .json({ message: "The authentication", status: "ERR" });
    }
  });
};

const authMiddleware = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  const id = req.params.id;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res
        .status(404)
        .json({ message: "Token is not valid", status: "ERR" });
    }
    const userData = await UserModel.findOne({ _id: user.id }).populate(
      "role_id",
      "name"
    );

    if (userData?.role_id?.name === "Administrator" || user?.id === id) {
      next();
    } else {
      return res
        .status(404)
        .json({ message: "The authentication", status: "ERR" });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided", status: "ERR" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Token is not valid", status: "ERR" });
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
module.exports = { authMiddleware, authAdminMiddleware, authUserMiddleware };
