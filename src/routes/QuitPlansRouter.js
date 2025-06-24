const express = require("express");
const routerQuitPlans = express.Router();
const QuitPlansController = require("../controller/QuitPlansController");
const { authenticateToken } = require("../middleware/authMiddleware");

routerQuitPlans.use(authenticateToken);

routerQuitPlans.get("/suggestions", QuitPlansController.getSuggestedPlan);

routerQuitPlans.post("/", QuitPlansController.createQuitPlan);

routerQuitPlans.get("/current", QuitPlansController.getCurrentPlan);

routerQuitPlans.put("/:planId", QuitPlansController.updateQuitPlan);

routerQuitPlans.put("/:planId/complete", QuitPlansController.completePlan);

routerQuitPlans.put("/:planId/cancel", QuitPlansController.cancelPlan);

routerQuitPlans.get("/history", QuitPlansController.getPlanHistory);

module.exports = routerQuitPlans;