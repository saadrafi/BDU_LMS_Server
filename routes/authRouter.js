const express = require("express");
const authRouter = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const otpGenarator = require("../utils/otpGenerator");
const { transporter, otpMailOptions } = require("../controllers/mailController");

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

const createOTP = async (email) => {
  console.log(checkIsOtpExists(email) + " " + email);
  if (checkIsOtpExists(email)) {
    deleteOTP(email);
  }
  const otp = otpGenarator(6);
  const hashOTP = await bcrypt.hash(otp, 10);
  const sql =
    "INSERT INTO otp (email, otp,created_at,expire_at) VALUES (?, ?,NOW(),DATE_ADD(NOW(), INTERVAL 5 MINUTE))";
  db.query(sql, [email, hashOTP], (err, result) => {
    if (err) {
      console.log("Error creating OTP: " + err);
    }
  });
  return otp;
};

const checkIsOtpExists = async (email) => {
  const sql = "SELECT * FROM otp WHERE email = ? ";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Error checking if OTP exists: " + err);
    }
    if (result.length > 0) {
      return true;
    }
  });
  return false;
};

const checkIsOtpExpired = (req, res, next) => {
  const sql = "SELECT * FROM otp WHERE email = ? ";
  db.query(sql, [req.body.email], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error checking if OTP is expired: " + err });
    }
    if (result.length > 0) {
      if (result[0].expire_at < new Date()) {
        return res.status(400).json({ msg: "OTP expired! Click Resend button" });
      }
    }
    next();
  });
};

const deleteOTP = (email) => {
  const sql = "DELETE FROM otp WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Error deleting OTP: " + err);
    }
  });
};

const saveStudentDetails = (req, res, next) => {
  const { id, phone, firstName, lastName, semester } = req.body;
  const department = req.body.id.substr(2, 2);
  const session =
    parseInt(req.body.id.substr(0, 2)) +
    2000 +
    "-" +
    (parseInt(req.body.id.substr(0, 2)) + 2000 + 1);

  console.log(department, session);
  const sql =
    "INSERT INTO students (id,phone, firstName, lastName, department, session,semester) VALUES (?, ?, ?, ?, ?, ?,?)";
  db.query(sql, [id, phone, firstName, lastName, department, session, semester], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error saving student details: " + err });
    }

    next();
  });
};

authRouter.post("/register", isRegistered, hashPassword, saveStudentDetails, (req, res) => {
  //   const { username, password } = req.body;

  const { id, email, password } = req.body;

  const registerQuery =
    "INSERT INTO users (id, email, password,role,created_at, updated_at,isVerified) VALUES (?, ?, ?,?,NOW(),NOW(),false)";
  db.query(registerQuery, [id, email, password, "student"], async (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error registering user: " + err });
    } else {
      const otp = await createOTP(email);
      sendOTPMail(email, otp);
      return res.status(200).json({
        status: 200,
        id: id,
        email: email,
        role: "student",
        msg: "User registered successfully!",
      });
    }
  });
});

const sendOTPMail = (email, otp) => {
  transporter.sendMail(otpMailOptions(email, otp), (err, info) => {
    if (err) {
      console.log("Error sending OTP: " + err);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const checkUser = async (password, hash) => {
  const match = await bcrypt.compare(password, hash);
  console.log(match);
  return match;
};

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    console.log(result);
    if (err) {
      return res.status(500).json({ msg: "Error logging in: " + err });
    }
    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found, please register first!" });
    }
    if (result[0].isVerified == false || result[0].password == null) {
      const otp = await createOTP(email);
      sendOTPMail(email, otp);
      return res
        .status(400)
        .json({ msg: "User not verified, please verify first!", isVerified: false, email: email });
    }

    if (result[0].isApproved == false) {
      return res.status(400).json({ msg: "User not approved by admin yet!" });
    }

    checkUser(password, result[0].password).then((match) => {
      if (match) {
        res.json({
          id: result[0].id,
          email: result[0].email,
          role: result[0].role,
          msg: "Logged in successfully!",
          status: 200,
        });
      } else {
        return res.status(400).json({ msg: "Wrong password!" });
      }
    });
  });
});

authRouter.post("/updatePassword", hashPassword, (req, res) => {
  const { email, password } = req.body;
  const sql = "UPDATE users SET password = ? WHERE email = ?";
  db.query(sql, [password, email], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error updating password: " + err });
    }
    res.json({ status: 200, msg: "Password updated successfully!" });
  });
});

authRouter.post("/sendOtp", (req, res) => {
  const email = req.body.email;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error sending OTP: " + err });
    }
    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found, please register first!" });
    }
    const otp = await createOTP(email);
    sendOTPMail(email, otp);
    return res.status(200).json({ status: 200, msg: "OTP sent successfully! Check your email" });
  });
});

authRouter.post("/verifyOtp", checkIsOtpExpired, (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);
  let data;
  const sql = "SELECT * FROM otp WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Error verifying user: " + err });
    }
    if (result.length === 0) {
      return res.status(400).json({ msg: "User not found, please register first!" });
    }
    const match = await bcrypt.compare(otp, result[0].otp);
    if (match) {
      const updateSql = "UPDATE users SET isVerified = ? WHERE email = ?";
      db.query(updateSql, [true, email], (err, result) => {
        if (err) {
          return res.status(500).json({ msg: "Error verifying user: " + err });
        }
        deleteOTP(email);
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
          if (err) {
            return res.status(500).json({ msg: "Error verifying user: " + err });
          }
          data = await result[0];
          const password = data.password ? true : false;
          console.log(data);
          return res.status(200).json({
            status: 200,
            msg: "User verified successfully!",
            id: data.id,
            email: data.email,
            role: data.role,
            isVerified: data.isVerified,
            password: password,
            isApproved: data.isApproved,
          });
        });
      });
    } else {
      return res.status(400).json({ msg: "Wrong OTP!" });
    }
  });
});

authRouter.post("/resendOtp", async (req, res) => {
  const { email } = req.body;
  const otp = await createOTP(email);
  sendOTPMail(email, otp);
  return res.status(200).json({ status: 200, msg: "OTP sent successfully! Check your email" });
});

module.exports = authRouter;
