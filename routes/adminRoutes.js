const express    = require("express");
const { getAllUsers, deleteUser, getStats, getByteForAdmin } = require("../controllers/adminController");
const auth       = require("../middleware/auth");
const authorize  = require("../middleware/authorize");

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, authorize("admin"));

router.get("/stats",        getStats);
router.get("/users",        getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/bytes/:id",   getByteForAdmin);

module.exports = router;