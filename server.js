require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/User");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/BBC-Test");
  console.log("Connected to DB");
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/auth", userRouter);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
