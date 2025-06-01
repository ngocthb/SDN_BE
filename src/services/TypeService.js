const TypeModel = require("../models/TypeModal");
const getAllTypes = async () => {
  try {
    const types = await TypeModel.find();
    if (!types || types.length === 0) {
      return { status: "ERR", message: "No types found" };
    }
    const restaurants = await TypeModel.find().populate(
      "restaurants",
      "name image description address stars reviews"
    );

    return restaurants;
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

module.exports = {
  getAllTypes,
};
