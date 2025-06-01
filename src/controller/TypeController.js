const TypeService = require("../services/TypeService");

const getAllTypes = async (req, res) => {
  try {
    const response = await TypeService.getAllTypes();
    if (!response) {
      return res.status(201).json({ status: "ERR", message: "No types found" });
    }
    return res.status(200).json({ status: "OK", data: response });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllTypes,
};
