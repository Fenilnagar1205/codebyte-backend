const Byte     = require("../models/Byte");
const Progress = require("../models/Progress");

// ── POST /api/bytes  (admin only) ─────────────────────────────────────────────
const createByte = async (req, res) => {
  try {
    const { title, content, quiz, xpReward } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const byte = await Byte.create({ title, content, quiz, xpReward });

    res.status(201).json({
      message: "Byte created successfully.",
      data: byte,
    });
  } catch (error) {
    console.error("createByte error:", error);
    res.status(500).json({ error: "Failed to create byte." });
  }
};

// ── GET /api/bytes  (authenticated) ──────────────────────────────────────────
const getAllBytes = async (req, res) => {
  try {
    const bytes = await Byte.find().select("-quiz.questions.correctOption");

    // Find which bytes this user has already completed
    const progress = await Progress.find({ user: req.user.id }).select("byte");
    const completedIds = new Set(progress.map((p) => p.byte.toString()));

    // Attach completed flag to each byte
    const data = bytes.map((byte) => ({
      _id:        byte._id,
      title:      byte.title,
      content:    byte.content,
      xpReward:   byte.xpReward,
      difficulty: byte.difficulty ?? "Beginner",
      category:   byte.category   ?? "General",
      quiz: {
        questions: byte.quiz?.questions?.map((q) => ({
          _id:      q._id,
          question: q.question,
          options:  q.options,
        })) || [],
      },
      completed: completedIds.has(byte._id.toString()),
      createdAt: byte.createdAt,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("getAllBytes error:", error);
    res.status(500).json({ error: "Failed to fetch bytes." });
  }
};

// ── GET /api/bytes/:id  (authenticated) ───────────────────────────────────────
const getSingleByte = async (req, res) => {
  try {
    const byte = await Byte.findById(req.params.id);
    if (!byte) return res.status(404).json({ error: "Byte not found." });

    // Strip correctOption — never expose to frontend
    const sanitizedQuestions = byte.quiz?.questions?.map((q) => ({
      _id:      q._id,
      question: q.question,
      options:  q.options,
    })) || [];

    // Check if user already attempted this byte's quiz
    const existingProgress = await Progress.findOne({
      user: req.user.id,
      byte: req.params.id,
    });

    res.json({
      success: true,
      data: {
        _id:        byte._id,
        title:      byte.title,
        content:    byte.content,
        xpReward:   byte.xpReward,
        difficulty: byte.difficulty ?? "Beginner",
        category:   byte.category   ?? "General",
        quiz:       { questions: sanitizedQuestions },
      },
      alreadyAttempted: !!existingProgress?.quizAttempted,
    });
  } catch (error) {
    console.error("getSingleByte error:", error);
    res.status(500).json({ error: "Failed to fetch byte." });
  }
};

// ── PUT /api/bytes/:id  (admin only) ──────────────────────────────────────────
const updateByte = async (req, res) => {
  try {
    const { title, content, quiz, xpReward, difficulty, category } = req.body;

    const byte = await Byte.findByIdAndUpdate(
      req.params.id,
      { title, content, quiz, xpReward, difficulty, category },
      { new: true, runValidators: true }
    );

    if (!byte) return res.status(404).json({ error: "Byte not found." });

    res.json({ success: true, message: "Byte updated.", data: byte });
  } catch (error) {
    console.error("updateByte error:", error);
    res.status(500).json({ error: "Failed to update byte." });
  }
};

// ── DELETE /api/bytes/:id  (admin only) ───────────────────────────────────────
const deleteByte = async (req, res) => {
  try {
    const byte = await Byte.findByIdAndDelete(req.params.id);
    if (!byte) return res.status(404).json({ error: "Byte not found." });

    // Clean up all progress records for this byte
    await Progress.deleteMany({ byte: req.params.id });

    res.json({ success: true, message: "Byte deleted." });
  } catch (error) {
    console.error("deleteByte error:", error);
    res.status(500).json({ error: "Failed to delete byte." });
  }
};

module.exports = { createByte, getAllBytes, getSingleByte, updateByte, deleteByte };