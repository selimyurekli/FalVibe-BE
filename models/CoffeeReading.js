const mongoose = require("mongoose");

const coffeeReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  userImage: {
    type: String, // base64 encoded image
    required: true,
  },
  generatedImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CoffeeReading", coffeeReadingSchema);
