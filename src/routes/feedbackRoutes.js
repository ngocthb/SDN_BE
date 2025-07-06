// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedbackController");
const { authUserMiddleware } = require("../middleware/authMiddleware");
const {
  validateCreateFeedback,
  validateUpdateFeedback,
} = require("../middleware/validation");

// Tất cả routes đều cần auth
router.use(authUserMiddleware);

// Tạo feedback mới - dùng validateCreateFeedback
router.post("/", validateCreateFeedback, feedbackController.createFeedback);

// Lấy tất cả feedback của user hiện tại
router.get("/my-feedback", feedbackController.getMyFeedback);

// Lấy feedback theo ID
router.get("/:id", feedbackController.getFeedbackById);

// Cập nhật feedback - dùng validateUpdateFeedback
router.put("/:id", validateUpdateFeedback, feedbackController.updateFeedback);

// Xóa feedback (chỉ khi status là pending)
router.delete("/:id", feedbackController.deleteFeedback);

module.exports = router;
