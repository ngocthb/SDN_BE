const express = require("express");
const router = express.Router();
const adminRatingController = require("../controller/adminRatingController");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/authMiddleware");

// Tất cả routes đều cần auth user + admin
router.use(authUserMiddleware);
router.use(authAdminMiddleware);

// Rating management
router.get("/", adminRatingController.getAllRatings);
router.delete("/:id", adminRatingController.deleteRating);

// Dashboard & Analytics
router.get("/dashboard", adminRatingController.getRatingDashboard);
router.get("/export", adminRatingController.exportRatings);

module.exports = router;
