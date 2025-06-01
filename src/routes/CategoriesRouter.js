const express = require("express");

const routerCategory = express.Router();
const categoryController = require("../controller/CategoryController");

routerCategory.get("/", categoryController.getAllCategory);
routerCategory.get("/:id", categoryController.getCategoryById);

module.exports = routerCategory;
