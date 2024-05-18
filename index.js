const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const morgan = require("morgan");
require("dotenv").config();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter/adminRouter");
const db = require("./db");
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

try {
  db.connect((err) => {
    if (err) {
      console.error("Error connecting to database: " + err);
    } else {
      console.log("Connected to database!");
    }
  });
} catch (err) {
  console.log("Error connecting to database: " + err);
}

app.get("/", (req, res) => res.json("Hello Server!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
