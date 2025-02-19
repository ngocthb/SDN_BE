const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const StatusModel = mongoose.model("status", statusSchema);
module.exports = StatusModel;
