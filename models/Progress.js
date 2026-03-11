const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId:     { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect:      { type: Boolean, required: true },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    byte: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Byte",
      required: true,
    },
    quizAttempted: {
      type: Boolean,
      default: false,
    },
    score:      { type: Number, default: 0 },   // number of correct answers
    percentage: { type: Number, default: 0 },   // 0-100
    xpEarned:   { type: Number, default: 0 },
    answers:    [answerSchema],
  },
  { timestamps: true }
);

// One progress record per user per byte
progressSchema.index({ user: 1, byte: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
