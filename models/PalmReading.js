const mongoose = require("mongoose");

const palmReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  questions: {
    type: String, // User's questions
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PalmReading", palmReadingSchema);
