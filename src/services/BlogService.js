const BlogModel = require("../models/BlogsModel");
const UserModel = require("../models/UserModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

exports.createBlog = async (dataRequest) => {
  const { title, content, authorId, imageUrl } = dataRequest;

  // Validate logic cơ bản
  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }
  if (title.trim().length < 5) {
    throw new Error("Title must be at least 5 characters");
  }

  if (!content || !content.trim()) {
    throw new Error("Content is required");
  }
  if (content.trim().length < 20) {
    throw new Error("Content must be at least 20 characters");
  }

  if (!authorId || !authorId.trim()) {
    throw new Error("Author ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(authorId.trim())) {
    throw new Error("Author ID is not valid");
  }

  const authorExists = await UserModel.findById(authorId.trim());
  if (!authorExists) {
    throw new Error("Author does not exist");
  }

  // KHÔNG CẦN VALIDATE IMAGEURL NỮA vì multer đã xử lý

  // Tạo blog
  const newBlog = await BlogModel.create({
    title: title.trim(),
    content: content.trim(),
    authorId: authorId.trim(),
    imageUrl: imageUrl || null, // imageUrl bây giờ là đường dẫn file trên server
  });

  return newBlog;
};

// Thay thế hàm getAllBlogs cũ của bạn bằng hàm này

exports.getAllBlogs = async ({ skip = 0, limit = 5 }) => {
  const blogs = await BlogModel.aggregate([
    // Bước 1: Sắp xếp các bài viết mới nhất lên đầu (hiệu quả hơn khi làm sớm)
    {
      $sort: { createdAt: -1 },
    },

    // Bước 2: Bỏ qua các bài đã tải (để phân trang)
    {
      $skip: skip,
    },

    // Bước 3: Giới hạn số lượng bài viết cho mỗi lần tải
    {
      $limit: limit,
    },

    // Bước 4: Nối với collection 'users' để lấy thông tin tác giả
    // Tương đương với populate('authorId')
    {
      $lookup: {
        from: "users", // Tên collection của user trong database
        localField: "authorId",
        foreignField: "_id",
        as: "authorInfo", // Tên mảng tạm thời chứa thông tin tác giả
      },
    },

    // Bước 5: Nối với collection 'comments' để đếm số lượng
    {
      $lookup: {
        from: "comments", // Tên collection của comment trong database
        localField: "_id", // So khớp blog._id
        foreignField: "blogId", // với comment.blogId
        as: "blogComments", // Tên mảng tạm thời chứa các comment
      },
    },

    // Bước 6: Thêm các trường mới và định dạng lại dữ liệu
    {
      $addFields: {
        // Tạo trường commentCount bằng cách đếm số phần tử trong mảng blogComments
        commentCount: { $size: "$blogComments" },

        // Lấy thông tin tác giả ra khỏi mảng authorInfo (vì lookup luôn trả về mảng)
        // và gán lại vào trường authorId, giống hệt kết quả của populate
        authorId: { $arrayElemAt: ["$authorInfo", 0] },
      },
    },

    // Bước 7: Dọn dẹp, loại bỏ các trường không cần thiết trước khi gửi về client
    {
      $project: {
        blogComments: 0, // Xóa mảng chứa các comment đầy đủ
        authorInfo: 0, // Xóa mảng chứa thông tin tác giả tạm thời
        "authorId.password": 0, // Luôn đảm bảo không lộ mật khẩu
        "authorId.emailVerified": 0,
        "authorId.role": 0,
        // ...xóa các trường không cần thiết khác của authorId nếu có
      },
    },
  ]);

  return blogs;
};

exports.deleteBlog = async (blogId) => {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    throw new Error("Invalid blog ID");
  }

  const blog = await BlogModel.findById(blogId);
  if (!blog) {
    throw new Error("Blog not found or already deleted");
  }

  // Nếu có ảnh, xử lý xóa file ảnh
  if (blog.imageUrl) {
    try {
      // Lấy tên file từ URL
      const imageFilename = blog.imageUrl.split("/uploads/")[1];
      if (imageFilename) {
        const imagePath = path.resolve("src/uploads", imageFilename);
        await fs.promises.unlink(imagePath); // Đồng bộ, chờ xóa
        console.log("Deleted image:", imageFilename);
      }
    } catch (err) {
      console.error("Failed to delete image:", err.message);
      // Không throw để không chặn việc xóa blog
    }
  }

  await BlogModel.findByIdAndDelete(blogId);

  return { message: "Blog and related image deleted successfully." };
};
