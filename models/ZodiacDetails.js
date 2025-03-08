const mongoose = require('mongoose');

const zodiacDetailsSchema = new mongoose.Schema({
  zodiac: {
    type: String,
    required: true,
    enum: ['koç', 'boğa', 'ikizler', 'yengeç', 'aslan', 'başak', 'terazi', 'akrep', 'yay', 'oğlak', 'kova', 'balık']
  },
  details: {
    positive: [String],
    negative: [String],
    numbers: [Number],
    day: String,
    color: String,
    stone: String
  },
  date: {
    type: Date,
    required: true
  }
});

// Burç ve tarih için birleşik index
zodiacDetailsSchema.index({ zodiac: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ZodiacDetails', zodiacDetailsSchema); 