const express    = require("express");
const { getMyProgress } = require("../controllers/progressController");
const auth       = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, getMyProgress);

module.exports = router;