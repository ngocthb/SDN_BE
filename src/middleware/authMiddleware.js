const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// middleware dịch token sang id người dùng
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
module.exports = { authUserMiddleware };
