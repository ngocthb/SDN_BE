const express = require("express");
const routerSubscription = express.Router();
const subscriptionController = require("../controller/SubscriptionController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

routerSubscription.use(authUserMiddleware);

routerSubscription.post("/", subscriptionController.createSubscription);

routerSubscription.get("/", subscriptionController.getAllSubscriptions);

// routerSubscription.get("/:id", subscriptionController.getSubscriptionById);

routerSubscription.put("/:id", subscriptionController.updateSubscription);

routerSubscription.delete("/:id", subscriptionController.deleteSubscription);

routerSubscription.put(
  "/extend/:id",
  subscriptionController.extendSubscription
);

routerSubscription.put(
  "/cancel/:id",
  subscriptionController.cancelSubscription
);

routerSubscription.get(
  "/my-subscription",
  subscriptionController.getMySubscription
);

routerSubscription.get(
  "/my-subscription/history",
  subscriptionController.getMySubscriptionHistory
);

module.exports = routerSubscription;
