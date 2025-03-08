const mongoose = require('mongoose');

const dailyHoroscopeSchema = new mongoose.Schema({
  zodiac: {
    type: String,
    required: true,
    enum: ['koç', 'boğa', 'ikizler', 'yengeç', 'aslan', 'başak', 'terazi', 'akrep', 'yay', 'oğlak', 'kova', 'balık']
  },
  horoscope: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

// Burç ve tarih için birleşik index
dailyHoroscopeSchema.index({ zodiac: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyHoroscope', dailyHoroscopeSchema); 