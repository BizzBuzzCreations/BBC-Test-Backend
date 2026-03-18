require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/User");
const { geminiAPI } = require("./utils/geminiAi");
const { getOpenAIApiRes } = require("./utils/openAi");
const User = require("./models/user");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
}

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/auth", userRouter);

app.get("/", async (req, res) => {
  const users = await User.find({});
  res.render("dashboard.ejs", { users, filter: req.query.filter || "all" });
});

app.get("/gemini", async (req, res) => {
  const response = await getOpenAIApiRes(
    "What is AI?",
    "AI stands for Artificial Intelligence. It refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. AI can perform tasks such as problem-solving, decision-making, and language understanding.",
  );
  res.send(response);
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
