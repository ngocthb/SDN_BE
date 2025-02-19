const express = require("express");
const routerUser = express.Router();
const userController = require("../controller/UserController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  authMiddleware,
  authAdminMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API quản lý người dùng
 */

/**
 * @swagger
 * /api/user/sign-up:
 *   post:
 *     summary: Đăng ký tài khoản mới dành cho role Administrator
 *     description: |
 *       Admin tạo người dùng mới có các role là Claimer , Approver, Finance , Administrator.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "user01"
 *               department:
 *                 type: string
 *                 example: "IT"
 *               job_rank:
 *                 type: string
 *                 example: "Developer"
 *               salary:
 *                 type: number
 *                 example: 1000
 *               role:
 *                 type: string
 *                 example: "Claimer"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Tài khoản đã được tạo thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Invalid email format"
 */
routerUser.post("/sign-up", authAdminMiddleware, userController.createUser);

/**
 * @swagger
 * /api/user/sign-in:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     description: Người dùng có thể đăng nhập vào hệ thống bằng tên đăng nhập và mật khẩu.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về thông tin người dùng và token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Login success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b0927cf080d7de92db3baa"
 *                     user_name:
 *                       type: string
 *                       example: "test"
 *                     role_name:
 *                       type: string
 *                       example: "Claimer"
 *                     avatar:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/avatar.jpg"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu.
 *       400:
 *         description: Thiếu thông tin đầu vào hoặc dữ liệu không hợp lệ.
 */
routerUser.post("/sign-in", userController.loginUser);

/**
 * @swagger
 * /api/user/update-user/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     description: Cập nhật thông tin cá nhân của người dùng. Chỉ có role là Administrator mới có thể cập nhật thông tin department, salary, rank, role , status.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần cập nhật thông tin role nhập là Claimer, Approver, Finance, Administrator
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "test"
 *               email:
 *                  type: string
 *                  example: "example@gmail.com"
 *               department:
 *                  type: string
 *                  example: "IT"
 *               job_rank:
 *                  type: string
 *                  example: "Developer"
 *               salary:
 *                  type: number
 *                  example: 1000
 *               role:
 *                  type: string
 *                  example: "Claimer"
 *               password:
 *                 type: string
 *                 example: "1234"
 *               status:
 *                 type: boolean
 *                 example: true
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện của người dùng (file hình ảnh)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Update success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b0927cf080d7de92db3baa"
 *                     user_name:
 *                       type: string
 *                       example: "test"
 *                     role_name:
 *                       type: string
 *                       example: "Claimer"
 *                     avatar:
 *                       type: string
 *                       example: "https://res.cloudinary.com/dievplv1n/image/upload/v1739629674/avatars/bhjwucqfeikbmhlwaroj.jpg"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Thiếu thông tin đầu vào hoặc dữ liệu không hợp lệ.
 *       404:
 *         description: Không tìm thấy người dùng.
 */
routerUser.put(
  "/update-user/:id",
  authUserMiddleware,
  upload.single("avatar"),
  userController.updateUser
);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Lấy thông tin người dùng từ token
 *     description: Lấy thông tin cá nhân của người dùng dựa trên token đăng nhập.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Login success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b0927cf080d7de92db3baa"
 *                     user_name:
 *                       type: string
 *                       example: "test"
 *                     role_name:
 *                       type: string
 *                       example: "Claimer"
 *                     avatar:
 *                       type: string
 *                       example: "https://res.cloudinary.com/dievplv1n/image/upload/v1739629674/avatars/bhjwucqfeikbmhlwaroj.jpg"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-15T13:11:24.453Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-15T14:51:11.316Z"
 *                 token:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Token không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Token is not valid or expired"
 */
routerUser.get("/", authUserMiddleware, userController.getUserByToken);

/**
 * @swagger
 * /api/user/get-all:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     description: Admin có thể xem danh sách tất cả người dùng với phân trang.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Số trang hiện tại (mặc định là 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng người dùng trên mỗi trang (mặc định là 10)
 *     responses:
 *       200:
 *         description: Trả về danh sách người dùng kèm theo thông tin phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Successfully retrieved all users"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "67b091e09d63acbb848c396b"
 *                           user_name:
 *                             type: string
 *                             example: "clamer1"
 *                           role_name:
 *                             type: string
 *                             example: "Claimer"
 *                           avatar:
 *                             type: string
 *                             example: "https://i.pinimg.com/736x/b1/13/a0/b113a01118e0286ce985ee01543422aa.jpg"
 *                           status:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-15T13:08:48.929Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-15T13:08:48.929Z"
 *                     total:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalUsers:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Permission denied"
 *       400:
 *         description: Yêu cầu không hợp lệ, có thể do tham số không hợp lệ hoặc thiếu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters"
 */

routerUser.get("/get-all", authAdminMiddleware, userController.getAllUser);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     description: Trả về thông tin cá nhân của một người dùng cụ thể dựa trên ID. Chỉ có role là Administrator mới có thể xem thông tin người dùng.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần lấy thông tin
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Successfully get user"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b091f69d63acbb848c3970"
 *                     user_name:
 *                       type: string
 *                       example: "approver1"
 *                     role_name:
 *                       type: string
 *                       example: "Approver"
 *                     avatar:
 *                       type: string
 *                       example: "https://i.pinimg.com/736x/b1/13/a0/b113a01118e0286ce985ee01543422aa.jpg"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-15T13:09:10.030Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-15T13:09:10.030Z"
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERR"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
routerUser.get("/:id", authAdminMiddleware, userController.getUserById);

module.exports = routerUser;
