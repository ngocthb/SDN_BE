const ProjectModel = require("../models/ProjectModel");

const getAllProject = async (page, limit, search) => {
  try {
    let totalProject = await ProjectModel.countDocuments();

    if (totalProject === 0) {
      return {
        status: "ERR",
        message: "No projects found",
      };
    }

    let projects = await ProjectModel.find()
      .populate("pm", "user_name")
      .populate("qa", "user_name")
      .populate({
        path: "technical_lead",
        select: "user_name",
      })
      .populate({
        path: "ba",
        select: "user_name",
      })
      .populate({
        path: "developers",
        select: "user_name",
      })
      .populate({
        path: "testers",
        select: "user_name",
      })
      .populate({
        path: "technical_consultancy",
        select: "user_name",
      });

    if (limit && page) {
      projects = projects.slice((page - 1) * limit, page * limit);
    }

    if (search) {
      projects = projects.filter((project) => {
        return project.project_name
          .toLowerCase()
          .includes(search.toLowerCase());
      });
    }

    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      status: "OK",
      message: "Successfully retrieved all projects",
      data: {
        projects,
        total: {
          currentPage: page || 1,
          totalProject,
          totalPage: Math.ceil(totalProject / limit) || 1,
          totalAllProject: projects.length,
        },
      },
    };
  } catch (error) {
    throw error;
  }
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
      let data = await ProjectModel.find({
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

      data.filter((project) => {
        return project.status === true;
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
