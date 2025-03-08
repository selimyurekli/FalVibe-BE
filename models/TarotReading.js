const mongoose = require("mongoose");

const tarotReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  cards: [
    {
      name: String,
      position: String,
      meaning: String,
    },
  ],
  interpretation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TarotReading", tarotReadingSchema);
