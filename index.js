const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const morgan = require("morgan");
require("dotenv").config();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());



app.get("/", (req, res) => res.json("Hello Server!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
