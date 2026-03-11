const Byte     = require("../models/Byte");
const Progress = require("../models/Progress");
const User     = require("../models/User");

// ── POST /api/bytes/:byteId/submit  (authenticated) ───────────────────────────
//
// Body: { answers: [{ questionId, selectedOption }] }
//
// - Looks up the correct answers from the DB (never from client)
// - Saves progress (upsert — allows retry but tracks first attempt)
// - Awards XP to the user
// - Returns score, percentage, xpEarned
// ─────────────────────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { byteId } = req.params;
    const { answers } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers must be a non-empty array." });
    }

    const byte = await Byte.findById(byteId);
    if (!byte) return res.status(404).json({ error: "Byte not found." });

    const questions = byte.quiz?.questions;
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: "This byte has no quiz questions." });
    }

    // ── Check for previous attempt ────────────────────────────────────────
    const existing = await Progress.findOne({ user: req.user.id, byte: byteId });
    if (existing?.quizAttempted) {
      // Allow retry but don't re-award XP
      return res.status(400).json({
        error: "You have already attempted this quiz.",
        score:      existing.score,
        percentage: existing.percentage,
        xpEarned:   0,
      });
    }

    // ── Grade answers ─────────────────────────────────────────────────────
    let score = 0;
    const evaluated = answers.map(({ questionId, selectedOption }) => {
      // Find the question by _id inside the subdocument array
      const question = questions.id(questionId);
      const isCorrect = question != null && question.correctOption === selectedOption;
      if (isCorrect) score++;
      return {
        questionId,
        selectedOption,
        isCorrect,
      };
    });

    const total      = questions.length;
    const percentage = Math.round((score / total) * 100);
    const xpPerCorrect = byte.xpReward ?? 10;
    const xpEarned   = score * xpPerCorrect;

    // ── Save progress ─────────────────────────────────────────────────────
    await Progress.findOneAndUpdate(
      { user: req.user.id, byte: byteId },
      {
        $set: {
          quizAttempted: true,
          score,
          percentage,
          xpEarned,
          answers: evaluated,
        },
      },
      { upsert: true, new: true }
    );

    // ── Award XP to user ──────────────────────────────────────────────────
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpEarned } });

    res.json({
      success:    true,
      score,
      total,
      percentage,
      xpEarned,
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res.status(500).json({ error: "Quiz submission failed." });
  }
};

module.exports = { submitQuiz };
