require("dotenv").config();
const OpenAI = require("openai");

const openRouterForText = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://falvibe.com",
      "X-Title": "FalVibe",
    },
  });

const openAiForImage = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { openRouterForText, openAiForImage };
