const express = require("express");
const router = express.Router();
const { optimizeAndConvertToBase64 } = require("../utils/file");
const PalmReading = require("../models/PalmReading");
require("dotenv").config();
const { openRouterForText } = require("../constants/openAiConstants");
const { palmPromptGenerator } = require("../utils/openAiPromptUtil");

router.post("/read", async (req, res) => {
  try {
    const { questions } = req.body;
    const firstName = req.userData?.firstName || "Değerli Misafirimiz";
    const userId = req.auth.userId;
    if (!questions || !req.file) {
      console.log("questions:", questions);
      return res
        .status(400)
        .json({ message: "El fotoğrafı ve sorular gerekli" });
    }

    const optimizedBase64Image = await optimizeAndConvertToBase64(
      req.file.buffer
    );
    const messages = palmPromptGenerator(
      firstName,
      optimizedBase64Image,
      questions
    );
    const response = await openRouterForText.chat.completions.create({
      model: process.env.OPEN_ROUTER_TEXT_MODEL,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    if (!response?.choices?.[0]?.message?.content) {
      console.error("Invalid API Response:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response from OpenRouter API");
    }

    const newReading = new PalmReading({
      userId,
      interpretation: response.choices[0].message.content,
      questions,
    });

    await newReading.save();

    res.json({
      reading: response.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    res.status(500).json({
      message: "Error reading palm",
      error: error.message || "Unknown error occurred",
    });
  }
});

module.exports = router;
