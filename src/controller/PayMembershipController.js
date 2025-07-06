const payMemberService = require("../services/PayMembershipService");

exports.createOrder = async (req, res) => {
  try {
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;

    const result = await payMemberService.createOrderAndBuildPaymentUrl(
      req.body,
      ipAddress
    );

    return res.status(200).json({
      success: true,
      message: "Order created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


exports.confirmPayment = async (req, res) => {
  try {
    const subscription = await payMemberService.confirmPayment(req.body);

    return res.status(200).json({
      success: true,
      message: "Payment confirmed. Subscription created.",
      data: subscription,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
