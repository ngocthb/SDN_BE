const express = require("express");
const AdminRouterMembership = express.Router();
const membershipController = require("../controller/MembershipController");
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/authMiddleware");

AdminRouterMembership.get("/", authUserMiddleware, authAdminMiddleware, membershipController.getAllMemberships);
AdminRouterMembership.get("/:id", authUserMiddleware, authAdminMiddleware, membershipController.getMembershipByIdAdmin);
AdminRouterMembership.post("/create", authUserMiddleware, authAdminMiddleware, membershipController.createMembership);
AdminRouterMembership.put("/update/:id", authUserMiddleware, authAdminMiddleware, membershipController.updateMembership);
AdminRouterMembership.delete("/delete/:id", authUserMiddleware, authAdminMiddleware, membershipController.deleteMembership);
AdminRouterMembership.patch("/restore/:id", authUserMiddleware, authAdminMiddleware, membershipController.restoreMembership);

module.exports = AdminRouterMembership;