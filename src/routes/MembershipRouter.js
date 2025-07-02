const express = require("express");
const routerMembership = express.Router();
const membershipController = require("../controller/MembershipController");

routerMembership.get("/", membershipController.getMemberships);
routerMembership.get("/all/", membershipController.getAllMemberships);
routerMembership.get("/:id", membershipController.getMembershipById);
routerMembership.post("/create", membershipController.createMembership);
routerMembership.put("/update/:id", membershipController.updateMembership);
routerMembership.delete("/delete/:id", membershipController.deleteMembership);
routerMembership.patch("/restore/:id", membershipController.restoreMembership);

module.exports = routerMembership;
