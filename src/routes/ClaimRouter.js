const express = require("express");
const routerClaim = express.Router();
const claimController = require("../controller/ClaimController");
const { authUserMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Claims
 *   description: API quản lý claims
 */

/**
 * @swagger
 * /claim:
 *   post:
 *     summary: Tạo yêu cầu bồi thường (Claim) mới
 *     description: Tạo một yêu cầu bồi thường mới cho người dùng có vai trò "Claimer".
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-17"
 *                 description: Ngày yêu cầu bồi thường.
 *               from:
 *                 type: string
 *                 example: "2025-02-17T09:00:00"
 *                 description: Thời gian bắt đầu.
 *               to:
 *                 type: string
 *                 example: "2025-02-17T17:00:00"
 *                 description: Thời gian kết thúc.
 *               total_no_of_hours:
 *                 type: integer
 *                 example: 8
 *                 description: Tổng số giờ làm việc.
 *               project_id:
 *                 type: string
 *                 example: "67b53cc84da1f1728f610095"
 *                 description: ID của dự án mà yêu cầu bồi thường liên quan.
 *               status:
 *                 type: string
 *                 example: "Draft"
 *                 description: Trạng thái của yêu cầu bồi thường (Draft, Pending).
 *               attached_file:
 *                 type: string
 *                 format: binary
 *                 description: Tệp đính kèm (nếu có).
 *               reason_claimer:
 *                 type: string
 *                 example: "Worked extra hours for project deadline"
 *                 description: Lý do yêu cầu bồi thường của người yêu cầu.
 *     responses:
 *       200:
 *         description: Tạo yêu cầu bồi thường thành công.
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
 *                   example: "Success create claim"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "67b091e09d63acbb848c396b"
 *                         user_name:
 *                           type: string
 *                           example: "clamer1"
 *                         role_name:
 *                           type: string
 *                           example: "Claimer"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         status:
 *                           type: boolean
 *                           example: true
 *                     project:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60c72b2f5f9b8d3c29b1f6d5"
 *                         project_name:
 *                           type: string
 *                           example: "Project A"
 *                         project_code:
 *                           type: string
 *                           example: "PA-123"
 *                         status:
 *                           type: string
 *                           example: "Active"
 *                     date:
 *                       type: string
 *                       example: "2025-02-17"
 *                     from:
 *                       type: string
 *                       example: "2025-02-17T09:00:00"
 *                     to:
 *                       type: string
 *                       example: "2025-02-17T17:00:00"
 *                     total_no_of_hours:
 *                       type: integer
 *                       example: 8
 *                     attached_file:
 *                       type: string
 *                       example: "https://example.com/file.pdf"
 *                     reason_claimer:
 *                       type: string
 *                       example: "Worked extra hours for project deadline"
 *       400:
 *         description: Dữ liệu yêu cầu không hợp lệ hoặc thiếu thông tin.
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
 *                   example: "All fields are required"
 *       403:
 *         description: Người dùng không có quyền truy cập.
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
 *                   example: "You are not allowed to access"
 *       500:
 *         description: Lỗi server hoặc xử lý.
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
 *                   example: "Internal server error"
 */
routerClaim.post("/", authUserMiddleware, claimController.createClaim);

/**
 * @swagger
 * /claim/download:
 *   get:
 *     summary: Xuất danh sách các Claim Request đã thanh toán trong tháng ra file Excel
 *     description: API này yêu cầu xác thực Bearer Token và sẽ lấy danh sách các Claim Request có trạng thái "Paid" trong tháng cụ thể rồi xuất ra file Excel.
 *     tags:
 *       - Claims
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tháng cần lấy dữ liệu (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Năm cần lấy dữ liệu
 *     responses:
 *       200:
 *         description: File Excel được tạo thành công và tải xuống
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Yêu cầu không hợp lệ (thiếu hoặc sai định dạng tháng/năm)
 *       401:
 *         description: Không có quyền truy cập, yêu cầu xác thực Bearer Token
 *       404:
 *         description: Không tìm thấy dữ liệu Paid Claims trong tháng yêu cầu
 *       500:
 *         description: Lỗi server khi tạo file Excel
 *
 * securityDefinitions:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */
routerClaim.get(
  "/download",
  authUserMiddleware,
  claimController.downloadPaidClaims
);

/**
 * @swagger
 * /claim:
 *   get:
 *     summary: Lấy danh sách yêu cầu bồi thường
 *     description: Lấy danh sách yêu cầu bồi thường với các bộ lọc, phân trang và sắp xếp.
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Trạng thái yêu cầu bồi thường (Draft, Pending, Approved, Paid, Rejected, Cancelled) chỉ dùng cho role Claimer và Admin. Mặc định là "all" (không cần nhập). Role là Approver thì trả về status là "Pending". Role là Finance thì trả về status là "Approved".
 *         schema:
 *           type: string
 *           example: "all"
 *       - in: query
 *         name: page
 *         description: Trang hiện tại.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Số lượng giới hạn ở mỗi trang.
 *         schema:
 *           type: integer
 *           example: 8
 *       - in: query
 *         name: sortBy
 *         description: Tên Trường cần sắp xếp.
 *         schema:
 *           type: string
 *           example: "date"
 *       - in: query
 *         name: sortOrder
 *         description: Hướng sắp xếp (asc, desc).
 *         schema:
 *           type: string
 *           example: "desc"
 *       - in: query
 *         name: staffName
 *         description: Tên nhân viên cần lọc. Dùng cho role Admin
 *         schema:
 *           type: string
 *           example: "test"
 *       - in: query
 *         name: projectName
 *         description: Tên dự án cần lọc.
 *         schema:
 *           type: string
 *           example: "abc"
 *       - in: query
 *         name: fromDate
 *         description: Ngày bắt đầu cần lọc (theo định dạng YYYY-MM-DD).
 *         schema:
 *           type: string
 *           example: "2025-02-01"
 *       - in: query
 *         name: toDate
 *         description: Ngày kết thúc cần lọc (theo định dạng YYYY-MM-DD).
 *         schema:
 *           type: string
 *           example: "2025-02-28"
 *       - in: query
 *         name: totalWorkingHours
 *         description: Tổng số giờ làm việc cần lọc.
 *         schema:
 *           type: integer
 *           example: 8
 *     responses:
 *       200:
 *         description: Trả về danh sách yêu cầu bồi thường.
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
 *                   example: "Successfully retrieved claims"
 *                 data:
 *                   type: object
 *                   properties:
 *                     claims:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60c72b2f5f9b8d3c29b1f6d5"
 *                           date:
 *                             type: string
 *                             example: "2025-02-17"
 *                           from:
 *                             type: string
 *                             example: "2025-02-17T09:00:00"
 *                           to:
 *                             type: string
 *                             example: "2025-02-17T17:00:00"
 *                           total_no_of_hours:
 *                             type: integer
 *                             example: 8
 *                           project_name:
 *                             type: string
 *                             example: "Project A"
 *                           user_name:
 *                             type: string
 *                             example: "clamer1"
 *                           reason_claimer:
 *                             type: string
 *                             example: "Worked extra hours for project deadline"
 *                           status:
 *                             type: string
 *                             example: "Pending"
 *                           attached_file:
 *                             type: string
 *                             example: "https://example.com/file.pdf"
 *                           createdAt:
 *                             type: string
 *                             example: "2025-02-17T10:00:00Z"
 *                           updatedAt:
 *                             type: string
 *                             example: "2025-02-17T10:00:00Z"
 *                     total:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalClaim:
 *                           type: integer
 *                           example: 10
 *                         totalPage:
 *                           type: integer
 *                           example: 2
 *                         totalAllClaim:
 *                           type: integer
 *                           example: 15
 *       403:
 *         description: Không có quyền truy cập.
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
 *       500:
 *         description: Lỗi server hoặc xử lý.
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
 *                   example: "Internal server error"
 */
routerClaim.get("/", authUserMiddleware, claimController.getClaim); // claimer thì trả về của nó thôi còn mấy role khác thì trả về tất cả

/**
 * @swagger
 * /claim/{id}:
 *   put:
 *     summary: Cập nhật yêu cầu bồi thường
 *     description: Cập nhật thông tin yêu cầu bồi thường dựa trên vai trò của người dùng. Chỉ có role Approver mới cập nhật đc reason_approver. Role Claimer cập nhập được status sang Pending hoặc Cancelled. Role Approver cập nhật được status sang Approved hoặc Rejected. Role Finance cập nhật status sang Paid.
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của yêu cầu bồi thường cần cập nhật.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: "Trạng thái mới của yêu cầu bồi thường (Pending, Cancelled, Approved, Rejected, Paid)."
 *                 example: "Pending"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: "Ngày làm việc liên quan đến yêu cầu."
 *                 example: "2025-02-17"
 *               from:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-17"
 *               to:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-17"
 *               total_no_of_hours:
 *                 type: number
 *                 description: "Tổng số giờ làm việc được yêu cầu."
 *                 example: 8
 *               attached_file:
 *                 type: string
 *                 format: binary
 *                 description: "Tệp đính kèm liên quan đến yêu cầu."
 *                 example: "https://example.com/attachment.pdf"
 *               reason_claimer:
 *                 type: string
 *                 description: "Lý do yêu cầu bồi thường của Claimer."
 *                 example: "Làm thêm giờ để hoàn thành dự án."
 *               reason_approver:
 *                 type: string
 *                 description: "Lý do phê duyệt hoặc từ chối của Approver."
 *                 example: "Đã kiểm tra và xác nhận hợp lệ."
 *     responses:
 *       200:
 *         description: Cập nhật yêu cầu bồi thường thành công.
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
 *                   example: "Successfully updated claim"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: "Thông tin người tạo yêu cầu."
 *                     project:
 *                       type: object
 *                       description: "Chi tiết dự án liên quan."
 *                     claim:
 *                       type: object
 *                       description: "Dữ liệu yêu cầu bồi thường đã cập nhật."
 *       403:
 *         description: Người dùng không có quyền cập nhật yêu cầu.
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
 *       404:
 *         description: Yêu cầu bồi thường không tồn tại.
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
 *                   example: "Claim not found"
 *       500:
 *         description: Lỗi server hoặc xử lý.
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
 *                   example: "Internal server error"
 */
routerClaim.put("/:id", authUserMiddleware, claimController.updateClaim);

/**
 * @swagger
 * /claim/{id}:
 *   get:
 *     summary: Lấy thông tin yêu cầu bồi thường
 *     description: Trả về thông tin chi tiết của một yêu cầu bồi thường dựa trên ID. Chỉ người tạo yêu cầu hoặc Admin mới có thể truy cập.
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của yêu cầu bồi thường cần lấy thông tin.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết của yêu cầu bồi thường.
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
 *                   example: "Successfully retrieved claim"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: "Thông tin người tạo yêu cầu."
 *                     project:
 *                       type: object
 *                       description: "Chi tiết dự án liên quan."
 *                     claim:
 *                       type: object
 *                       description: "Dữ liệu yêu cầu bồi thường."
 *       403:
 *         description: Người dùng không có quyền truy cập yêu cầu này.
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
 *       404:
 *         description: Yêu cầu bồi thường không tồn tại.
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
 *                   example: "Claim not found"
 *       500:
 *         description: Lỗi server hoặc xử lý.
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
 *                   example: "Internal server error"
 */
routerClaim.get("/:id", authUserMiddleware, claimController.getClaimById);

module.exports = routerClaim;
