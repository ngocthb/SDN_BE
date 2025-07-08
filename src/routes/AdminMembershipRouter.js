const express = require("express");
const AdminRouterMembership = express.Router();
const membershipController = require("../controller/MembershipController");

AdminRouterMembership.get("/", membershipController.getAllMemberships);
AdminRouterMembership.get(
  "/statistics",
  membershipController.getMembershipStatistics
);
AdminRouterMembership.get("/:id", membershipController.getMembershipByIdAdmin);
AdminRouterMembership.post("/create", membershipController.createMembership);
AdminRouterMembership.put("/update/:id", membershipController.updateMembership);
AdminRouterMembership.delete(
  "/delete/:id",
  membershipController.deleteMembership
);
AdminRouterMembership.patch(
  "/restore/:id",
  membershipController.restoreMembership
);

module.exports = AdminRouterMembership;
