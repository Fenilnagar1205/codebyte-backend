const Progress = require("../models/Progress");

// ── GET /api/progress/me ──────────────────────────────────────────────────────
// Returns all progress records for the logged-in user,
// with the byte title populated so frontend can check badge conditions
const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.user.id,
      quizAttempted: true,
    })
      .populate("byte", "title")   // only pull in the title field
      .sort({ createdAt: -1 });

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getMyProgress error:", err);
    res.status(500).json({ error: "Failed to fetch progress." });
  }
};

module.exports = { getMyProgress };