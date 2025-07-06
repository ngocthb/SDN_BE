const express = require("express");
const routerMembership = express.Router();
const membershipController = require("../controller/MembershipController");

routerMembership.get("/", membershipController.getMemberships);
routerMembership.get("/:id", membershipController.getMembershipById);

module.exports = routerMembership;
