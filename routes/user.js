const { Signup, Login, Logout, addMarks } = require("../controllers/user");
const { userVerification } = require("../middlewares/authMiddleware");
const { verifyUser } = require("../middlewares/verifyUser");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/", userVerification);
router.post("/add-marks", addMarks);

module.exports = router;
