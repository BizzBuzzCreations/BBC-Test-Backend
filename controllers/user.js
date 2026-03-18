const User = require("../models/user");
const { getOpenAIApiRes } = require("../utils/openAi");
const { createSecretToken } = require("../utils/secretToken");
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    if (!email || !password || !username) {
      return res.json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // required for cross-site cookies over HTTPS
      sameSite: "none", //this one too
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User signed in successfully",
      success: true,
      user: user.username,
    });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // required for cross-site cookies over HTTPS
      sameSite: "none", //this one too
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User logged in successfully",
      success: true,
      user: user.username,
    });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

module.exports.Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.status(201).json({ message: "Logged out successfully", success: true });
};

//marks from frontend
module.exports.addMarks = async (req, res) => {
  try {
    const { testId, marks } = req.body;
    const user = req.user;
    if (!testId || marks === undefined || marks === null) {
      return res.json({ message: "All fields are required" });
    }
    user.allMarks.push({ testId, marks });
    user.totalMarks += marks;
    await user.save();
    res.json({ message: "Marks added successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

//marks from backend (Open AI)
module.exports.aiMarks = async (req, res) => {
  try {
    const { testId, question, answer, topic } = req.body;
    const user = req.user;
    if (!question || !answer || !testId) {
      return res.json({ message: "All fields are required" });
    }

    if (testId === "Part-G") user.isDone = true;

    const response = await getOpenAIApiRes(question, answer, topic);
    const marks = response?.score ?? 0;
    user.allMarks.push({ testId, marks });
    user.totalMarks += marks;
    await user.save();
    res.json({
      message: "Marks added successfully",
      success: true,
      feedback: response?.feedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
