const mongoose = require("mongoose");

const dreamReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  dream: {
    type: String, // User's dream description
    required: true,
  },
  answers: {
    type: Object, // User's answers to questions
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DreamReading", dreamReadingSchema);
