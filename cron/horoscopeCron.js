const cron = require('node-cron');
const OpenAI = require("openai");
const DailyHoroscope = require('../models/DailyHoroscope');
const ZodiacDetails = require('../models/ZodiacDetails');
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://falvibe.com",
    "X-Title": "FalVibe",
  },
});

const zodiacSigns = ['koç', 'boğa', 'ikizler', 'yengeç', 'aslan', 'başak', 'terazi', 'akrep', 'yay', 'oğlak', 'kova', 'balık'];

async function generateHoroscope(zodiac) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sen deneyimli bir astrolog ve burç yorumcususun. ${zodiac} burcunun günlük yorumunu yapacaksın. Yorumunda şu noktalara değin: günlük genel durum, aşk hayatı, iş/kariyer, sağlık. Cevabını Türkçe olarak ver ve gizemli, bilge bir dil kullan.`,
        },
        {
          role: "user",
          content: `${zodiac} burcu için günlük yorum yazar mısın?`,
        },
      ],
      max_tokens: 5000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating horoscope for ${zodiac}:`, error);
    throw error;
  }
}

async function generateZodiacDetails(zodiac) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sen bir astroloji uzmanısın. ${zodiac} burcu hakkında detaylı bilgi vereceksin. Yanıtını tam olarak aşağıdaki JSON formatında ver:
{
  "positive": ["özellik1", "özellik2", "özellik3"],
  "negative": ["özellik1", "özellik2", "özellik3"],
  "numbers": [1, 2, 3],
  "day": "Pazartesi",
  "color": "Kırmızı",
  "stone": "Yakut"
}`,
        },
        {
          role: "user",
          content: `${zodiac} burcu hakkında detaylı bilgi verir misin?`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    let details;
    try {
      details = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      const formatResponse = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sen bir JSON formatlayıcısın. Verilen metni tam olarak aşağıdaki formatta JSON'a dönüştür:
{
  "positive": ["özellik1", "özellik2", "özellik3"],
  "negative": ["özellik1", "özellik2", "özellik3"],
  "numbers": [1, 2, 3],
  "day": "Pazartesi",
  "color": "Kırmızı",
  "stone": "Yakut"
}`,
          },
          {
            role: "user",
            content: `Bu metni JSON formatına dönüştür: ${response.choices[0].message.content}`,
          },
        ],
        max_tokens: 500,
      });

      details = JSON.parse(formatResponse.choices[0].message.content);
    }

    return details;
  } catch (error) {
    console.error(`Error generating zodiac details for ${zodiac}:`, error);
    throw error;
  }
}

async function updateDailyHoroscopes() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Starting daily horoscope update:', new Date().toLocaleString('tr-TR'));

  try {
    for (const zodiac of zodiacSigns) {
      // Check if today's data already exists
      const existingHoroscope = await DailyHoroscope.findOne({ zodiac, date: today });
      const existingDetails = await ZodiacDetails.findOne({ zodiac, date: today });

      if (!existingHoroscope || !existingDetails) {
        console.log(`Generating new data for ${zodiac}`);
        
        // Generate and save daily horoscope if it doesn't exist
        if (!existingHoroscope) {
          const horoscope = await generateHoroscope(zodiac);
          await DailyHoroscope.findOneAndUpdate(
            { zodiac, date: today },
            { horoscope },
            { upsert: true, new: true }
          );
        }
        
        // Generate and save zodiac details if it doesn't exist
        if (!existingDetails) {
          const details = await generateZodiacDetails(zodiac);
          await ZodiacDetails.findOneAndUpdate(
            { zodiac, date: today },
            { details },
            { upsert: true, new: true }
          );
        }
        
        console.log(`Updated horoscope and details for ${zodiac}`);
      } else {
        console.log(`Data already exists for ${zodiac}, skipping...`);
      }
    }
    console.log('Daily update process completed:', new Date().toLocaleString('tr-TR'));
  } catch (error) {
    console.error('Error updating daily horoscopes and details:', error);
  }
}

// Her 1 dakikada bir çalışacak cron job (Test için)
const cronJob = cron.schedule('0 0/5 * 1/1 * *', updateDailyHoroscopes, {
  timezone: "Europe/Istanbul"
});

// İlk çalıştırma için fonksiyon
async function initialRun() {
  console.log('Performing initial run...');
  await updateDailyHoroscopes();
}

module.exports = {
  cronJob,
  initialRun
}; 