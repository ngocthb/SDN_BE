const express = require("express");

const routerType = express.Router();
const typeController = require("../controller/TypeController");

routerType.get("/", typeController.getAllTypes);

module.exports = routerType;
