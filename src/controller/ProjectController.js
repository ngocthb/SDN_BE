const ProjectService = require("../services/ProjectService");
const ProjectModel = require("../models/ProjectModel");

const getAllProject = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await ProjectService.getAllProject(
      parseInt(page),
      parseInt(limit),
      search
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const response = await ProjectService.createProject(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProjectService.getProjectById(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const updateProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await ProjectService.updateProjectById(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getProjectByUserId = async (req, res) => {
  try {
    const userID = req.user.id;
    const response = await ProjectService.getProjectByUserId(userID);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllProject,
  getProjectById,
  createProject,
  updateProjectById,
  getProjectByUserId,
};
