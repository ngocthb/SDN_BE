const express = require("express");
const routerSmokingStatus = express.Router();
const SmokingStatusController = require("../controller/SmokingStatusController");

routerSmokingStatus.post("/", SmokingStatusController.createOrUpdateSmokingStatus);

routerSmokingStatus.get("/", SmokingStatusController.getSmokingStatus);

routerSmokingStatus.get("/calculate-cost", SmokingStatusController.calculateSmokingCost);

routerSmokingStatus.delete("/", SmokingStatusController.deleteSmokingStatus);

routerSmokingStatus.get("/all", SmokingStatusController.getAllSmokingStatus);

module.exports = routerSmokingStatus;