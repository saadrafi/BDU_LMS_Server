const express = require("express");
const adminRouter = express.Router();
const db = require("../../db");
const {
  transporter,
  approvedMailOptions,
  addUserMail,
} = require("../../controllers/mailController");

adminRouter.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting users: " + err });
    }
    res.json(result);
  });
});

adminRouter.post("/approveUser", (req, res) => {
  const { id, email } = req.body;
  console.log(id);
  const sql = "UPDATE users SET isApproved = ? WHERE id = ?";
  db.query(sql, [true, id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error approving user: " + err });
    }
    res.json({ status: 200, msg: "User approved successfully!" });
    transporter.sendMail(approvedMailOptions(email), (err, info) => {
      if (err) {
        console.log("Error sending mail: " + err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
});

const saveStudentDetails = (user) => {
  const { id, phone, firstName, lastName, semester } = user;
  const department = user.id.substr(2, 2);
  const session =
    parseInt(user.id.substr(0, 2)) + 2000 + "-" + (parseInt(user.id.substr(0, 2)) + 2000 + 1);

  const sql =
    "INSERT INTO students (id,phone, firstName, lastName, department, session,semester) VALUES (?, ?, ?, ?, ?, ?,?)";
  db.query(sql, [id, phone, firstName, lastName, department, session, semester], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error saving student details: " + err });
    }
  });
};

const saveTeacherDetails = (user) => {
  const { id, phone, firstName, lastName } = user;
  const sql = "INSERT INTO teachers (id, phone, firstName, lastName) VALUES (?, ?, ?, ?)";
  db.query(sql, [id, phone, firstName, lastName], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error saving teacher details: " + err });
    }
  });
};

const saveAdminDetails = (user) => {
  const { id, phone, firstName, lastName } = user;
  const sql = "INSERT INTO admins (id, phone, firstName, lastName) VALUES (?, ?, ?, ?)";
  db.query(sql, [id, phone, firstName, lastName], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error saving admin details: " + err });
    }
  });
};

const saveUserDetails = (req, res, next) => {
  const { role } = req.body;
  if (role === "student") {
    saveStudentDetails(req.body);
  } else if (role === "teacher") {
    saveTeacherDetails(req.body);
  } else if (role === "admin") {
    saveAdminDetails(req.body);
  }
  next();
};

const isRegistered = (req, res, next) => {
  const email = req.body.email;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error checking if user is registered: " + err });
    } else if (result.length > 0) {
      return res.status(400).json({ msg: "User already registered" });
    } else {
      next();
    }
  });
};

adminRouter.post("/addUser", isRegistered, saveUserDetails, (req, res) => {
  const { id, email, role } = req.body;
  console.log(id, email, role);
  const sql = "INSERT INTO users (id, email, role, isVerified, isApproved) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [id, email, role, false, true], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: "Error adding user: " + err });
    }
    transporter.sendMail(addUserMail(email), (err, info) => {
      if (err) {
        console.log("Error sending mail: " + err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.json({ status: 200, msg: "User added successfully!" });
  });
});

adminRouter.get("/courses", (req, res) => {
  console.log("courses");
  const sql = "SELECT * FROM courses";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error getting courses: " + err });
    }
    res.json(result);
  });
});

module.exports = adminRouter;
