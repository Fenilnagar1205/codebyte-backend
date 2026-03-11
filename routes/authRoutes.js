const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",    loginUser);
router.get("/me",        auth, getMe);   // returns full user object (no password)

module.exports = router;
