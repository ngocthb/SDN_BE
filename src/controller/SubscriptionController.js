const subscriptionService = require("../services/SubscriptionService");

exports.createSubscription = async (req, res) => {
  try {
    const data = req.body;

    await subscriptionService.validateSubscription(data);

    const newSubscription = await subscriptionService.createSubscription(data);

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.getSubscriptionById(id);

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await subscriptionService.updateSubscription(id, data);

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    await subscriptionService.deleteSubscription(id);

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.extendSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await subscriptionService.extendSubscription(id);

    return res.status(200).json({
      success: true,
      message: "Subscription extended successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error extending subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await subscriptionService.cancelSubscription(id);

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await subscriptionService.getMySubscription(userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error) {
    console.error("Error fetching my subscription:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getMySubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await subscriptionService.getMySubscriptionHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      data: result.subscriptions,
      pagination: result.pagination,
      message: "Lấy lịch sử subscription thành công",
    });
  } catch (error) {
    console.error("Error fetching my subscription history:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
