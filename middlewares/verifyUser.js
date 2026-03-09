const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
