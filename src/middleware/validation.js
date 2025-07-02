// middleware/validation.js
const { body, validationResult } = require("express-validator");

// Middleware xử lý kết quả validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "ERR",
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });
  }
  next();
};

// Validation cho Rating Platform
const validateRating = [
  body("rating")
    .notEmpty()
    .withMessage("Điểm đánh giá là bắt buộc")
    .isInt({ min: 1, max: 5 })
    .withMessage("Điểm đánh giá phải từ 1-5"),

  body("aspectRated")
    .optional()
    .isIn([
      "overall",
      "features",
      "coach-quality",
      "content",
      "user-interface",
      "support",
    ])
    .withMessage("Khía cạnh đánh giá không hợp lệ"),

  body("comment")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bình luận tối đa 500 ký tự"),

  body("membershipPackage")
    .optional()
    .isIn(["free", "basic", "premium", "vip"])
    .withMessage("Gói thành viên không hợp lệ"),

  body("wouldRecommend")
    .optional()
    .isBoolean()
    .withMessage("Giá trị recommend phải là true/false"),

  handleValidationErrors,
];

// Validation cho CREATE Feedback
const validateCreateFeedback = [
  body("type")
    .notEmpty()
    .withMessage("Loại phản hồi là bắt buộc")
    .isIn(["bug", "suggestion", "complaint", "compliment", "other"])
    .withMessage("Loại phản hồi không hợp lệ"),

  body("subject")
    .notEmpty()
    .withMessage("Tiêu đề là bắt buộc")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Tiêu đề phải từ 5-200 ký tự"),

  body("message")
    .notEmpty()
    .withMessage("Nội dung là bắt buộc")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Nội dung phải từ 10-2000 ký tự"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Mức độ ưu tiên không hợp lệ"),

  handleValidationErrors,
];

// Validation cho UPDATE Feedback (không validate type)
const validateUpdateFeedback = [
  body("subject")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Tiêu đề phải từ 5-200 ký tự"),

  body("message")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Nội dung phải từ 10-2000 ký tự"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Mức độ ưu tiên không hợp lệ"),

  handleValidationErrors,
];

module.exports = {
  validateRating,
  validateFeedback: validateCreateFeedback, // Giữ tên cũ cho compatibility
  validateCreateFeedback,
  validateUpdateFeedback,
};
