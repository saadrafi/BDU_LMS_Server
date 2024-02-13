const express = require("express");
const authRouter = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

const isRegistered = (req, res, next) => {
  const email = req.body.email;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(500).json("Error checking if user is registered: " + err);
    } else if (result.length > 0) {
      return res.status(400).json("User already registered");
    } else {
      next();
    }
  });
};

const hashPassword = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  const password = req.body.password;
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      return res.status(500).json("Error hashing password: " + err);
    }
    req.body.password = hash;
    next();
  });
};

authRouter.post("/register", isRegistered, hashPassword, (req, res) => {
  //   const { username, password } = req.body;

  const { id, email, password } = req.body;
  console.log(id, email, password);
  const registerQuery =
    "INSERT INTO users (id, email, password,role,created_at, updated_at) VALUES (?, ?, ?,?,NOW(),NOW())";
  db.query(registerQuery, [id, email, password, "user"], (err, result) => {
    if (err) {
      return res.status(500).json("Error registering user: " + err);
    } else {
      return res.status(200).json("User registered successfully!");
    }
  });
});



module.exports = authRouter;
