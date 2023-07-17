require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const connection = require("./config/connection");

const app = express();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: accessLogStream }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assests");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// routes
app.post("/api/books", (req, res) => {
  const { name, linnk } = req.body;
  res.json({ name, linnk });
});

app.get("/api/books", async (req, res) => {
  try {
    const [rows] = await connection.promise().execute("SELECT * FROM books");
    res.json(rows);
  } catch (error) {
    res.json(error);
  }
});

// Port
const port = process.env.PORT || 311;
app.listen(port, () => console.log(`listening on port ${port}`));
