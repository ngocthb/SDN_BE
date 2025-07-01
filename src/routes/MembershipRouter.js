const express = require("express");
const routerMembership = express.Router();
const membershipController = require("../controller/MembershipController");

routerMembership.post("/", membershipController.createMembership);

routerMembership.get("/", membershipController.getAllMemberships);

routerMembership.get("/:id", membershipController.getMembershipById);

routerMembership.put("/:id", membershipController.updateMembership);

routerMembership.delete("/:id", membershipController.deleteMembership);

module.exports = routerMembership;
