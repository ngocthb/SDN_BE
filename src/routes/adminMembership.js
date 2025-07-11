const express = require("express");
const router = express.Router();
const AdminMembershipController = require("../controller/AdminMembershipController");

router.get("/statistics", AdminMembershipController.getMembershipStatistics);

module.exports = router;
