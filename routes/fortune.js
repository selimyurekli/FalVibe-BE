const express = require("express");
const router = express.Router();
require("dotenv").config();
const CoffeeReading = require("../models/CoffeeReading");
const { convertImageUrlToBase64 } = require("../utils/file");
const { openRouterForText } = require("../constants/openAiConstants");
const { openAiForImage } = require("../constants/openAiConstants");
const fileUploadMiddleware = require("../middleware/fileUpload");
const checkWallet = require("../middleware/checkWallet");
const decrementWallet = require("../middleware/decrementWallet");

const {
  fortunePromptGenerator,
  fortuneGenerateImageSummarizerPromptGenerator,
  fortuneGenerateImagePromptGenerator,
} = require("../utils/openAiPromptUtil");

router.post(
  "/read",
  checkWallet("COFFEE"),
  fileUploadMiddleware,
  decrementWallet("COFFEE"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Fotoğraf yüklenmedi" });
      }
      const userId = req.auth.userId;
      const firstName = req.userData?.firstName || "Değerli Misafirimiz";
      const base64Image = req.file.buffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      const messages = fortunePromptGenerator(firstName, dataUrl);
      const response = await openRouterForText.chat.completions.create({
        model: process.env.OPEN_ROUTER_TEXT_MODEL,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const newReading = new CoffeeReading({
        userId,
        interpretation: response.choices[0].message.content,
        userImage: dataUrl,
      });

      await newReading.save();

      return res.status(200).json({
        fortune: response.choices[0].message.content,
        _id: newReading._id,
        interpretation: response.choices[0].message.content,
      });
    } catch (error) {
      console.error("Error reading fortune:", error);
      res
        .status(500)
        .json({ message: "Error reading fortune", error: error.message });
    }
  }
);

router.post(
  "/generate-image",
  checkWallet("COFFEE_PHOTO"),
  decrementWallet("COFFEE_PHOTO"),
  async (req, res) => {
    try {
      const { fortune, readingId } = req.body;

      if (!fortune || !readingId) {
        return res
          .status(400)
          .json({ message: "Fortune text and reading ID are required." });
      }

      const userId = req.auth.userId;
      const firstName = req.userData?.firstName || "Değerli Misafirimiz";

      // Önce falın varlığını ve kullanıcıya ait olduğunu kontrol et
      const existingReading = await CoffeeReading.findOne({
        _id: readingId,
        userId,
      });
      if (!existingReading) {
        return res
          .status(404)
          .json({ message: "Fortune reading not found or unauthorized" });
      }

      const summarizeResponse = await openRouterForText.chat.completions.create(
        {
          model: "openai/gpt-4o-mini",
          messages: fortuneGenerateImageSummarizerPromptGenerator(
            firstName,
            fortune
          ),
          max_tokens: 100,
        }
      );

      const storyVersion = summarizeResponse.choices[0].message.content;

      const prompt = fortuneGenerateImagePromptGenerator(storyVersion);

      const response = await openAiForImage.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      const base64Image = await convertImageUrlToBase64(imageUrl);

      // Spesifik falı güncelle
      const updatedFortune = await CoffeeReading.findByIdAndUpdate(
        readingId,
        { generatedImage: base64Image },
        { new: true }
      );

      if (!updatedFortune) {
        throw new Error("Failed to update fortune reading");
      }

      res.json({
        story: storyVersion,
        baseUrl: imageUrl,
      });
    } catch (error) {
      console.error("Error generating fortune image:", error);
      res.status(500).json({
        message: "Error generating fortune image",
        error: error.message,
      });
    }
  }
);

module.exports = router;
