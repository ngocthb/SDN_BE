const express = require("express");
const routerSmokingStatus = express.Router();
const SmokingStatusController = require("../controller/SmokingStatusController");
const {
    authUserMiddleware,
} = require("../middleware/authMiddleware");

routerSmokingStatus.use(authUserMiddleware);

routerSmokingStatus.post("/", SmokingStatusController.createOrUpdateSmokingStatus);

routerSmokingStatus.put("/", SmokingStatusController.createOrUpdateSmokingStatus);

routerSmokingStatus.get("/", SmokingStatusController.getSmokingStatus);

routerSmokingStatus.get("/calculate-cost", SmokingStatusController.calculateSmokingCost);

routerSmokingStatus.delete("/", SmokingStatusController.deleteSmokingStatus);

module.exports = routerSmokingStatus;