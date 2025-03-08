const express = require("express");
const router = express.Router();
const DreamReading = require("../models/DreamReading");
const {dreamQuestions} = require("../constants/dreamConstants")
require("dotenv").config();


const {openRouterForText} = require("../constants/openAiConstants");
const {dreamPromptGenerator} = require("../utils/openAiPromptUtil");

router.post("/interpret", async (req, res) => {
  try {
    const { dream, answers } = req.body;
    const firstName = req.userData?.firstName || "Değerli Misafirimiz";
    const userId = req.auth.userId;

    if (!dream) {
      return res.status(400).json({ message: "Lütfen rüyanızı anlatın" });
    }

    const response = await openRouterForText.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: dreamPromptGenerator(firstName, dream, dreamQuestions, answers),
      max_tokens: 1000,
      temperature: 0.7,
    });

    if (!response?.choices?.[0]?.message?.content) {
      console.error("Invalid API Response:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response from OpenRouter API");
    }

    const interpretation = response.choices[0].message.content;

    const newReading = new DreamReading({
      userId,
      dream,
      answers,
      interpretation,
    });

    await newReading.save();

    res.json({
      interpretation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error interpreting dream",
      error: error.message || "Unknown error occurred",
    });
  }
});


module.exports = router;
