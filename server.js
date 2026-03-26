require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/user");
const { geminiAPI } = require("./utils/geminiAi");
const { getOpenAIApiRes } = require("./utils/openAi");
const User = require("./models/user");
const { error } = require("console");
const dns = require("dns");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
}

app.use(
  cors({
    origin: ["http://localhost:5173", "https://bbc-test.bbcfinsrv.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/auth", userRouter);

// DNS config (only for development)
if (process.env.NODE_ENV === "development") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google
  dns.setDefaultResultOrder("ipv4first");
}

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

app.use((err, req, res, next) => {
  console.log(err);
  let { status = 500, message = "SOME ERROR" } = err;
  res.status(status).render("error", { message, status });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
