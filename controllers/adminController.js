const User     = require("../models/User");
const Byte     = require("../models/Byte");
const Progress = require("../models/Progress");

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Clean up their progress records too
    await Progress.deleteMany({ user: id });

    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalBytes, progressRecords] = await Promise.all([
      User.countDocuments(),
      Byte.countDocuments(),
      Progress.find({ quizAttempted: true }),
    ]);

    const totalXP = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$xp" } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBytes,
        totalCompletions: progressRecords.length,
        totalXPAwarded:   totalXP[0]?.total ?? 0,
      },
    });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
};


// ── GET /api/admin/bytes/:id — full byte with correctOption for editing ────────
const getByteForAdmin = async (req, res) => {
  try {
    const byte = await require("../models/Byte").findById(req.params.id);
    if (!byte) return res.status(404).json({ error: "Byte not found." });
    res.json({ success: true, data: byte });
  } catch (err) {
    console.error("getByteForAdmin error:", err);
    res.status(500).json({ error: "Failed to fetch byte." });
  }
};

module.exports = { getAllUsers, deleteUser, getStats, getByteForAdmin };