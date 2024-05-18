const express = require("express");
const extraRouter = express.Router();
const db = require("../../db");

extraRouter.get("/departments", (req, res) => {
  const sql = "SELECT * FROM department";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting departments: " + err });
    }
    res.json(result);
  });
});

extraRouter.get("/teachers", (req, res) => {
  //   concat first name and last name with space
  const sql =
    "SELECT teachers.id, CONCAT(firstName, ' ', lastName) as name FROM teachers inner join users on teachers.id = users.id where users.isApproved = 1 and users.isVerified = 1";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting teachers: " + err });
    }
    res.json(result);
  });
});

extraRouter.get("/sessions", (req, res) => {
  const sql = "SELECT * FROM sessions ORDER BY session ASC";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting sessions: " + err });
    }
    res.json(result);
  });
});

module.exports = extraRouter;
