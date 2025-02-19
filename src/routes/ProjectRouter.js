const express = require("express");
const routerProject = express.Router();
const projectController = require("../controller/ProjectController");
const { authAdminMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: API quản lý projects
 */

/**
 * @swagger
 * /api/project/get-all:
 *   get:
 *     summary: Get all projects with pagination
 *     description: Retrieve a list of all projects with optional pagination.
 *     tags: [Project]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of projects per page for pagination.
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
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
 *                   example: "Successfully get all project"
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - project_name
 *                           - duration
 *                           - pm
 *                           - qa
 *                           - technical_lead
 *                           - ba
 *                           - developers
 *                           - testers
 *                           - technical_consultancy
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The project ID
 *                           project_name:
 *                             type: string
 *                             description: Name of the project
 *                           duration:
 *                             type: object
 *                             properties:
 *                               from:
 *                                 type: string
 *                                 format: date
 *                               to:
 *                                 type: string
 *                                 format: date
 *                           pm:
 *                             type: string
 *                             format: uuid
 *                             description: Project Manager's User ID
 *                           qa:
 *                             type: string
 *                             format: uuid
 *                             description: Quality Assurance's User ID
 *                           technical_lead:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uuid
 *                           ba:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uuid
 *                           developers:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uuid
 *                           testers:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uuid
 *                           technical_consultancy:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: uuid
 *                     total:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalClaim:
 *                           type: integer
 *                           example: 50
 *                         totalPage:
 *                           type: integer
 *                           example: 5
 *                         totalAllClaim:
 *                           type: integer
 *                           example: 100
 *       401:
 *         description: Unauthorized
 */
routerProject.get(
  "/get-all",
  authAdminMiddleware,
  projectController.getAllProject
);

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with all required fields. Admin role is required.
 *     tags: [Project]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_name
 *               - duration
 *               - pm
 *               - qa
 *               - technical_lead
 *               - ba
 *               - developers
 *               - testers
 *               - technical_consultancy
 *             properties:
 *               project_name:
 *                 type: string
 *                 description: Name of the project
 *               duration:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *               pm:
 *                 type: string
 *                 format: uuid
 *               qa:
 *                 type: string
 *                 format: uuid
 *               technical_lead:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               ba:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               developers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               testers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               technical_consultancy:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Successfully created a new project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - project_name
 *                 - duration
 *                 - pm
 *                 - qa
 *                 - technical_lead
 *                 - ba
 *                 - developers
 *                 - testers
 *                 - technical_consultancy
 *               properties:
 *                 _id:
 *                   type: string
 *                 project_name:
 *                   type: string
 *                 duration:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date
 *                     to:
 *                       type: string
 *                       format: date
 *                 pm:
 *                   type: string
 *                   format: uuid
 *                 qa:
 *                   type: string
 *                   format: uuid
 *                 technical_lead:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 ba:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 developers:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 testers:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 technical_consultancy:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden. The user is not authorized to create a project.
 *       500:
 *         description: Internal server error.
 */
routerProject.post("/", authAdminMiddleware, projectController.createProject);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve details of a specific project by its ID.
 *     tags: [Project]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved project details.
 *       404:
 *         description: Project not found.
 */
routerProject.get(
  "/:id",
  authAdminMiddleware,
  projectController.getProjectById
);

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Update project by ID
 *     description: Update project details by project ID. Admin role is required.
 *     tags: [Project]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_name
 *               - duration
 *               - pm
 *               - qa
 *               - technical_lead
 *               - ba
 *               - developers
 *               - testers
 *               - technical_consultancy
 *             properties:
 *               project_name:
 *                 type: string
 *               duration:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *               pm:
 *                 type: string
 *                 format: uuid
 *               qa:
 *                 type: string
 *                 format: uuid
 *               technical_lead:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               ba:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               developers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               testers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               technical_consultancy:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Successfully updated the project.
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
 *                   example: "Project updated successfully"
 *                 data:
 *                   type: object
 *                   required:
 *                     - project_name
 *                     - duration
 *                     - pm
 *                     - qa
 *                     - technical_lead
 *                     - ba
 *                     - developers
 *                     - testers
 *                     - technical_consultancy
 *                   properties:
 *                     _id:
 *                       type: string
 *                     project_name:
 *                       type: string
 *                     duration:
 *                       type: object
 *                       properties:
 *                         from:
 *                           type: string
 *                           format: date
 *                         to:
 *                           type: string
 *                           format: date
 *                     pm:
 *                       type: string
 *                       format: uuid
 *                     qa:
 *                       type: string
 *                       format: uuid
 *                     technical_lead:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                     ba:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                     developers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                     testers:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                     technical_consultancy:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *       400:
 *         description: Invalid data provided.
 *       404:
 *         description: Project not found.
 *       403:
 *         description: Forbidden. The user is not authorized to update this project.
 *       500:
 *         description: Internal server error.
 */
routerProject.put(
  "/:id",
  authAdminMiddleware,
  projectController.updateProjectById
);

module.exports = routerProject;
