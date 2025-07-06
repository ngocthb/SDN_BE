const express = require("express");
const router = express.Router();
const adminFeedbackController = require("../controller/adminFeedbackController");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/authMiddleware");

// Tất cả routes đều cần auth user + admin
router.use(authUserMiddleware);
router.use(authAdminMiddleware);

// Feedback management
router.get("/", adminFeedbackController.getAllFeedback);
router.put("/:id/status", adminFeedbackController.updateFeedbackStatus);
router.post("/:id/respond", adminFeedbackController.respondToFeedback);
router.delete("/:id", adminFeedbackController.deleteFeedback);

// Dashboard & Analytics
router.get("/dashboard", adminFeedbackController.getFeedbackDashboard);
router.get("/export", adminFeedbackController.exportFeedback);

module.exports = router;
