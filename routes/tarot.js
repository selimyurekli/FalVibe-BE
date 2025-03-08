const express = require("express");
const router = express.Router();
require("dotenv").config();
const TarotReading = require("../models/TarotReading");

const { openRouterForText } = require("../constants/openAiConstants");
const { tarotCards } = require("../constants/tarotConstants");
const { tarotPromptGenerator } = require("../utils/openAiPromptUtil");

router.post("/read", async (req, res, next) => {
  try {
    const { answers, selectedCardIndexes } = req.body;

    const firstName = req.userData?.firstName || "Değerli Misafirimiz";
    const userId = req.auth.userId;

    if (!answers || !selectedCardIndexes || selectedCardIndexes.length !== 3) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const selectedCards = selectedCardIndexes.map((index) => {
      const cardIndex = index % tarotCards.length;
      return tarotCards[cardIndex];
    });

    const messages = tarotPromptGenerator(firstName, selectedCards, answers);
    const response = await openRouterForText.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    if (!response?.choices?.[0]?.message?.content) {
      console.error("Invalid API Response:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response from OpenRouter API");
    }

    const newReading = new TarotReading({
      userId,
      cards: selectedCards,
      interpretation: response.choices[0].message.content,
    });

    await newReading.save();

    res.json({
      cards: selectedCards,
      reading: response.choices[0].message.content,
    });
    next();
  } catch (error) {
    console.log(error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    res.status(500).json({
      message: "Error reading tarot",
      error: error.message || "Unknown error occurred",
    });
  }
});

module.exports = router;
