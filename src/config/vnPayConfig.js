const { VNPay, ignoreLogger } = require("vnpay");
const dotenv = require("dotenv")
dotenv.config();

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE,
  secureSecret: process.env.VNPAY_SECRET_KEY,
  vnpayHost: "https://sandbox.vnpayment.vn",
  queryDrAndRefundHost: "https://sandbox.vnpayment.vn",
  testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
  hashAlgorithm: "SHA512", // tùy chọn
  loggerFn: ignoreLogger, // tùy chọn
});

module.exports = vnpay;