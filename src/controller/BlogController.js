const BlogService = require("../services/BlogService");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    // req.file được tạo bởi multer
    // Nếu không có file, req.file sẽ là undefined
    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // Validation cơ bản vẫn có thể giữ lại
    if (!title || !title.trim() || !content || !content.trim() || !authorId) {
      return res.status(400).json({
        status: "Err",
        message: "Title, content, and authorId are required fields",
      });
    }

    const newBlog = await BlogService.createBlog({
      title,
      content,
      authorId,
      // Truyền đường dẫn của file đã upload vào service
      // Thay thế đường dẫn '\' bằng '/' để tương thích với URL
      imageUrl: imageUrl
        ? `${process.env.SERVER_URL}/${imageUrl.substring(4)}`
        : null,
    });

    // Populate thông tin author trước khi trả về để frontend có thể hiển thị
    const populatedBlog = await newBlog.populate("authorId", "name picture");

    return res.status(201).json({
      status: "OK",
      data: populatedBlog, // Trả về blog đã có thông tin author
    });
  } catch (error) {
    console.error("Error creating blog:", error.message);
    return res.status(400).json({
      status: "Err",
      message: error.message,
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { skip = 0, limit = 5 } = req.body;
    const blogs = await BlogService.getAllBlogs({ skip, limit });

    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const result = await BlogService.deleteBlog(blogId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting blog:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
