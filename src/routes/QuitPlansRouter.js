const express = require("express");
const routerQuitPlans = express.Router();
const QuitPlansController = require("../controller/QuitPlansController");
const {
    authUserMiddleware,
} = require("../middleware/authMiddleware");

routerQuitPlans.use(authUserMiddleware);

routerQuitPlans.get("/suggestions", QuitPlansController.getSuggestedPlan);

routerQuitPlans.post("/", QuitPlansController.createQuitPlan);

routerQuitPlans.get("/current", QuitPlansController.getCurrentPlan);

routerQuitPlans.get("/current-stage", QuitPlansController.getCurrentStage);

routerQuitPlans.get("/stages/:stageId", QuitPlansController.getStageById);

routerQuitPlans.put("/:planId", QuitPlansController.updateQuitPlan);

routerQuitPlans.put("/:planId/complete", QuitPlansController.completePlan);

routerQuitPlans.put("/:planId/cancel", QuitPlansController.cancelPlan);

routerQuitPlans.get("/history", QuitPlansController.getPlanHistory);

module.exports = routerQuitPlans;