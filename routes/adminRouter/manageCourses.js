const express = require("express");
const courseRouter = express.Router();
const db = require("../../db");

const isCourseExists = (req, res, next) => {
  const { id } = req.body;
  const sql = "SELECT * FROM courses WHERE id = ?";
  db.query(sql, [id.toLowerCase()], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error checking if course exists: " + err });
    } else if (result.length > 0) {
      return res.status(400).json({ msg: "Course already exists" });
    } else {
      next();
    }
  });
};

courseRouter.get("/courses", (req, res) => {
  const sql = "SELECT * FROM courses";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting courses: " + err });
    }
    console.log(result);
    res.json(result);
  });
});

courseRouter.post("/addCourse", isCourseExists, (req, res) => {
  const { id, name, credit } = req.body;
  const sql = "INSERT INTO courses (id, name, credit) VALUES (?, ?, ?)";
  db.query(sql, [id.toLowerCase(), name, credit], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error adding course: " + err });
    }
    res.json({ status: 200, msg: "Course added successfully!" });
  });
});

courseRouter.put("/updateCourse", (req, res) => {
  const { id, name, credit } = req.body;
  const sql = "UPDATE courses SET name = ?, credit = ? WHERE id = ?";
  db.query(sql, [name, credit, id.toLowerCase()], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error updating course: " + err });
    }
    res.json({ status: 200, msg: "Course updated successfully!" });
  });
});

courseRouter.delete("/deleteCourse", (req, res) => {
  const { id } = req.body;
  const sql = "DELETE FROM courses WHERE id = ?";
  db.query(sql, [id.toLowerCase()], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error deleting course: " + err });
    }
    res.json({ status: 200, msg: "Course deleted successfully!" });
  });
});

const isAssignCourseExists = (req, res, next) => {
  const { courseCode, semester, session, department } = req.body;
  const sql =
    "SELECT * FROM assignCourses WHERE courseID = ? AND semester = ? AND session = ? AND department = ?";
  db.query(sql, [courseCode, semester, session, department], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error checking if course is assigned: " + err });
    } else if (result.length > 0) {
      return res.status(400).json({ msg: "Course already assigned" });
    } else {
      next();
    }
  });
};

courseRouter.post("/assignCourse", isAssignCourseExists, (req, res) => {
  const { courseCode, teacher, semester, department, session } = req.body;
  const sql =
    "INSERT INTO assignCourses (courseID, teacherID, semester, department, session) VALUES (?, ?, ?, ?,?)";
  db.query(sql, [courseCode, teacher, semester, department, session], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error assigning course: " + err });
    }
    res.json({ status: 200, msg: "Course assigned successfully!" });
  });
});

courseRouter.get("/assignedCourses", (req, res) => {
  const sql =
    "SELECT assignCourses.id, assignCourses.session,courses.id as courseCode,courses.name as courseName,courses.credit,department.name as department,CONCAT(teachers.firstName,' ',teachers.lastName) as teacherName,teachers.id as teacherID,semester.description as semester FROM assignCourses INNER JOIN courses ON assignCourses.courseID = courses.id INNER JOIN teachers ON assignCourses.teacherID = teachers.id INNER JOIN department ON assignCourses.department = department.id INNER JOIN semester ON assignCourses.semester = semester.id";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting assigned courses: " + err });
    }
    res.json(result);
  });
});

courseRouter.delete("/deleteAssignedCourse", (req, res) => {
  const id = req.body.id;
  const sql = "DELETE FROM assignCourses WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error deleting assigned course: " + err });
    }
    res.json({ status: 200, msg: "Assigned course deleted successfully!" });
  });
});

module.exports = courseRouter;
