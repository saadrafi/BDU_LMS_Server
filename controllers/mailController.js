const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const otpMailOptions = (email, otp) => {
  return {
    from: {
      name: "BDU LMS",
      address: process.env.MAIL_USERNAME,
    },
    to: email,
    subject: "OTP for Email Verification",
    html: `<div>
    <h1>BDU LMS</h1>
    <p>Your OTP for Email Verification is<b> ${otp}</b></p>
    </div>`,
  };
};

const approvedMailOptions = (email) => {
  return {
    from: {
      name: "BDU LMS",
      address: process.env.MAIL_USERNAME,
    },
    to: email,
    subject: "Account Approved",
    html: `<div>
    <h1>BDU LMS</h1>
    <p>Your account has been approved by the admin.</p>
    </div>`,
  };
};

const addUserMail = (email) => {
  return {
    from: {
      name: "BDU LMS",
      address: process.env.MAIL_USERNAME,
    },
    to: email,
    subject: "Account Created",
    html: `<div>
    <h1>BDU LMS</h1>
    <p>Your account has been created successfully.</p>
    <a href="http://localhost:5173/verify-otp">Click here to login</a>
    </div>`,
  };
};

module.exports = { transporter, otpMailOptions, approvedMailOptions, addUserMail};
