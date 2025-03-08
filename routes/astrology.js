const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const DailyHoroscope = require("../models/DailyHoroscope");
const ZodiacDetails = require("../models/ZodiacDetails");
require("dotenv").config();

// Initialize OpenAI with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://falvibe.com",
    "X-Title": "FalVibe",
  },
});

// Günlük burç yorumu almak için endpoint
router.get("/daily/:zodiac", async (req, res) => {
  try {
    const { zodiac } = req.params;
    const firstName = req.userData?.firstName || "Değerli Misafirimiz";

    // Bugünün tarihini al (saat 00:00:00 olarak)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Database'den bugünün yorumunu ara
    const dailyHoroscope = await DailyHoroscope.findOne({
      zodiac,
      date: today,
    });
  
    // Eğer bugünün yorumu yoksa, yeni bir yorum oluştur ve kaydet
    if (!dailyHoroscope) {
      return res
        .status(500)
        .json({ message: "Günlük fal yorumu yapılıyor. Lütfen bekleyiniz." });
    }

    // Yorumu kişiselleştir
    const personalizedHoroscope = dailyHoroscope.horoscope.replace(
      /Değerli Misafirimiz/g,
      firstName
    );

    res.json({
      horoscope: personalizedHoroscope,
    });
  } catch (error) {
    console.error("Error getting daily horoscope:", error);
    res.status(500).json({
      message: "Error getting daily horoscope",
      error: error.message,
    });
  }
});

// Burç detaylarını almak için endpoint
router.get("/details/:zodiac", async (req, res) => {
  try {
    const { zodiac } = req.params;

    // Bugünün tarihini al (saat 00:00:00 olarak)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Database'den bugünün detaylarını ara
    const zodiacDetails = await ZodiacDetails.findOne({
      zodiac,
      date: today,
    });

    if (!zodiacDetails) {
      return res.status(500).json({
        message: "Burç detayları hazırlanıyor. Lütfen bekleyiniz.",
      });
    }

    res.json(zodiacDetails.details);
  } catch (error) {
    console.error("Error getting zodiac details:", error);
    res.status(500).json({
      message: "Error getting zodiac details",
      error: error.message,
      defaultData: {
        positive: ["Güçlü", "Kararlı", "Lider"],
        negative: ["İnatçı", "Sabırsız", "Dominant"],
        numbers: [1, 4, 7],
        day: "Pazartesi",
        color: "Kırmızı",
        stone: "Yakut",
      },
    });
  }
});

// Burç uyumu hesaplamak için endpoint
router.get("/compatibility/:zodiac1/:zodiac2", async (req, res) => {
  try {
    const { zodiac1, zodiac2 } = req.params;
    const firstName = req.userData?.firstName || "Değerli Misafirimiz";

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sen deneyimli bir astroloji uzmanısın. ${zodiac1} ve ${zodiac2} burçlarının uyumunu detaylı bir şekilde analiz edeceksin.

Yanıtını şu başlıklar altında yapılandır:
1. Genel Uyum: İki burcun genel karakteristik uyumu
2. Aşk İlişkisi: Romantik ilişkilerdeki uyum ve zorluklar
3. Arkadaşlık: Arkadaşlık ilişkisindeki dinamikler
4. İş/Kariyer: İş ortamındaki işbirliği potansiyeli

Her bölüm için 0-100 arası bir uyum puanı da ver. Örnek format:
"Genel Uyum (75/100): ..."

Cevabını Türkçe olarak ver ve ${firstName} için kişiselleştirilmiş, samimi bir dil kullan.`,
        },
        {
          role: "user",
          content: `${zodiac1} ve ${zodiac2} burçlarının uyumunu analiz eder misin?`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Yanıtı kontrol et
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response");
    }

    const compatibility = response.choices[0].message.content;

    // Varsayılan yanıt
    const defaultResponse = `${zodiac1} ve ${zodiac2} burçları arasındaki uyum analizi:

Genel Uyum (70/100): Bu iki burç arasında dengeli bir uyum potansiyeli vardır.

Aşk İlişkisi (65/100): Farklılıklar ilişkiyi zenginleştirebilir.

Arkadaşlık (75/100): Güçlü bir arkadaşlık bağı kurabilirler.

İş/Kariyer (80/100): İş ortamında birbirlerini tamamlayabilirler.`;

    res.json({
      compatibility: compatibility || defaultResponse,
    });
  } catch (error) {
    console.error("Error getting zodiac compatibility:", error);
    res.status(500).json({
      message: "Error getting zodiac compatibility",
      error: error.message,
      defaultResponse: `${zodiac1} ve ${zodiac2} burçları arasındaki uyum şu anda hesaplanamıyor. Lütfen daha sonra tekrar deneyin.`,
    });
  }
});

module.exports = router;
