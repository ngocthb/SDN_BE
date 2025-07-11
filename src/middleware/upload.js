const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  // Thư mục để lưu file upload
  destination: function (req, file, cb) {
    cb(null, "src/uploads/"); // Đảm bảo bạn đã tạo thư mục 'uploads' trong 'src'
  },
  // Đặt lại tên file để tránh trùng lặp
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Kiểm tra loại file, chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .png, .gif format allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Giới hạn kích thước file 5MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
