const CategoryServices = require("../services/CategoryServices");

const getAllCategory = async (req, res) => {
  try {
    const response = await CategoryServices.getAllCategory();
    if (!response) {
      return res
        .status(201)
        .json({ status: "ERR", message: "No categories found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await CategoryServices.getCategoryById(id);
    if (!response) {
      return res.status(201).json({
        status: "ERR",
        message: "No category found with this ID",
      });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllCategory,
  getCategoryById,
};
