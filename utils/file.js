const axios = require("axios");
const sharp = require("sharp");

// Function to convert image URL to base64
async function convertImageUrlToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Process and optimize the image using sharp
    const optimizedImageBuffer = await sharp(response.data)
      .resize(256, 256) // Reduced from 512x512 to 384x384
      .jpeg({ quality: 40 }) // Reduced quality from 70% to 60%
      .toBuffer();

    const base64Image = optimizedImageBuffer.toString("base64");
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

async function optimizeAndConvertToBase64(buffer) {
  try {
    const optimizedImageBuffer = await sharp(buffer)
      .resize(256, 256) // Same size as coffee reading images
      .jpeg({ quality: 40 }) // Same quality as coffee reading images
      .toBuffer();

    const base64Image = optimizedImageBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw error;
  }
}
module.exports = { convertImageUrlToBase64, optimizeAndConvertToBase64 };
