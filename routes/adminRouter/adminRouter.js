// adminRouter.js
const express = require("express");
const adminRouter = express.Router();
const manageUsers = require("./manageUsers");
const manageCourses = require("./manageCourses");
const extraRouter = require("./extra");

adminRouter.use("/", manageUsers);
adminRouter.use("/", manageCourses);
adminRouter.use("/", extraRouter);

module.exports = adminRouter;
