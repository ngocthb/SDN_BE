const ProjectModel = require("../models/ProjectModel");

const getAllProject = async (page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await ProjectModel.find();

      if (!data) {
        resolve({
          status: "ERR",
          message: "Project does not exist",
        });
      }

      const totalProject = data.length;
      if (limit && page) {
        data = data.slice((page - 1) * limit, page * limit);
      }

      const dataOutput = {
        projects: data,
        total: {
          currentPage: page || 1,
          totalProject: totalProject,
          totalPage: Math.ceil(totalProject / limit) || 1,
          totalAllProject: data.length,
        },
      };
      resolve({
        status: "OK",
        message: "Successfully get all project",
        data: dataOutput,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const createProject = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const project = new ProjectModel(data);
      const result = await project.save();
      resolve({
        status: "OK",
        message: "Successfully create project",
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProjectById = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await ProjectModel.findById(id).populate(
        "pm qa technical_lead ba developers testers technical_consultancy"
      );
      if (!data) {
        resolve({
          status: "ERR",
          message: "Project does not exist",
        });
      }
      resolve({
        status: "OK",
        message: "Successfully get project",
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProjectById = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await ProjectModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!result) {
        resolve({
          status: "ERR",
          message: "Project does not exist",
        });
      }
      resolve({
        status: "OK",
        message: "Successfully update project",
        data: result,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProjectByUserId = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await ProjectModel.find({
        $or: [
          { pm: userId },
          { qa: userId },
          { technical_lead: { $in: [userId] } },
          { ba: { $in: [userId] } },
          { developers: { $in: [userId] } },
          { testers: { $in: [userId] } },
          { technical_consultancy: { $in: [userId] } },
        ],
      });

      const totalProject = data.length;

      if (data) {
        resolve({
          status: "OK",
          message: "Successfully get project",
          data: data,
          total: {
            totalProject: totalProject,
          },
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAllProject,
  createProject,
  getProjectById,
  updateProjectById,
  getProjectByUserId,
};
