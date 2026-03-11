const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: (arr) => arr.length >= 2,
      message: "At least 2 options are required",
    },
  },
  correctOption: {
    type: Number,
    required: [true, "Correct option index is required"],
  },
});

const byteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    quiz: {
      questions: [questionSchema],
    },
    xpReward: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Byte", byteSchema);