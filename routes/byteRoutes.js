const express   = require("express");
const { createByte, getAllBytes, getSingleByte, updateByte, deleteByte } = require("../controllers/byteController");
const { submitQuiz } = require("../controllers/quizController");
const auth      = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post(  "/",               auth, authorize("admin"), createByte);
router.get(   "/",               auth, getAllBytes);
router.get(   "/:id",            auth, getSingleByte);
router.put(   "/:id",            auth, authorize("admin"), updateByte);
router.delete("/:id",            auth, authorize("admin"), deleteByte);
router.post(  "/:byteId/submit", auth, submitQuiz);

module.exports = router;
