// middleware/validation.js
const { body, query, validationResult } = require("express-validator");

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

// Validation cho Rating Platform (đã cập nhật)
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

  // Giữ lại membershipPackage để backward compatibility
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

// Validation cho query params của rating stats
const validateRatingStatsQuery = [
  query("aspectRated")
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

  query("membershipType")
    .optional()
    .isIn(["free", "basic", "premium", "vip"])
    .withMessage("Loại membership không hợp lệ"),

  query("membershipPackage")
    .optional()
    .isIn(["free", "basic", "premium", "vip"])
    .withMessage("Gói thành viên không hợp lệ"),

  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Ngày bắt đầu phải có định dạng hợp lệ (YYYY-MM-DD)"),

  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Ngày kết thúc phải có định dạng hợp lệ (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (req.query.dateFrom && value) {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(value);
        if (dateFrom > dateTo) {
          throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
        }
      }
      return true;
    }),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Trang phải là số nguyên dương"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Giới hạn phải từ 1-100"),

  handleValidationErrors,
];

// Validation cho pagination (dùng chung)
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Trang phải là số nguyên dương"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Giới hạn phải từ 1-100"),

  handleValidationErrors,
];

// Validation cho rating ID params
const validateRatingId = [
  body().custom((value, { req }) => {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID không hợp lệ");
    }
    return true;
  }),

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

// Validation cho admin feedback status update
const validateFeedbackStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Trạng thái là bắt buộc")
    .isIn(["pending", "in-progress", "resolved", "closed"])
    .withMessage("Trạng thái không hợp lệ"),

  body("adminNote")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Ghi chú admin tối đa 1000 ký tự"),

  handleValidationErrors,
];

// Validation cho feedback query filters
const validateFeedbackQuery = [
  query("type")
    .optional()
    .isIn(["bug", "suggestion", "complaint", "compliment", "other"])
    .withMessage("Loại phản hồi không hợp lệ"),

  query("status")
    .optional()
    .isIn(["pending", "in-progress", "resolved", "closed"])
    .withMessage("Trạng thái không hợp lệ"),

  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Mức độ ưu tiên không hợp lệ"),

  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Ngày bắt đầu phải có định dạng hợp lệ"),

  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Ngày kết thúc phải có định dạng hợp lệ"),

  ...validatePagination,
];

module.exports = {
  // Rating validations
  validateRating,
  validateRatingStatsQuery,
  validateRatingId,
  validatePagination,

  validateFeedback: validateCreateFeedback,
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackStatusUpdate,
  validateFeedbackQuery,

  // Helper
  handleValidationErrors,
};
