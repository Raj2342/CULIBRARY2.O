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
    cb(null, "../client/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

// routes
app.post(
  "/api/books",
  upload.fields([
    { name: "book_pdf", maxCount: 1 },
    { name: "book_img", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { book_pdf, book_img } = req.files;
      const pdf = book_pdf[0].path;
      const image = book_img[0].path;
      const { title, desc, genre, author } = req.body;
      await connection.promise().execute(
        `INSERT INTO books(title, des, image, pdf, genre, author) 
            VALUES(?,?,?,?,?,?)`,
        [title, desc, image, pdf, genre, author]
      );
      res.json("book created");
    } catch (error) {
      res.json(error);
    }
  }
);

app.get("/api/books", async (req, res) => {
  const Searchquery = req.query.genre;
  try {
    if (Searchquery) {
      const [rows] = await connection
        .promise()
        .execute("SELECT * FROM books WHERE genre=?", [Searchquery]);
      res.json(rows);
    } else {
      const [rows] = await connection.promise().execute("SELECT * FROM books");
      res.json(rows);
    }
  } catch (error) {
    res.json(error);
  }
});

// Port
const port = process.env.PORT || 311;
app.listen(port, () => console.log(`listening on port ${port}`));
