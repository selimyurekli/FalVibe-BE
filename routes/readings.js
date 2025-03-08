const express = require("express");
const router = express.Router();
const TarotReading = require("../models/TarotReading");
const CoffeeReading = require("../models/CoffeeReading");
const PalmReading = require("../models/PalmReading");
const DreamReading = require("../models/DreamReading");

// Get all tarot readings for a user
router.get("/tarot", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const readings = await TarotReading.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, readings });
  } catch (error) {
    console.error("Error fetching tarot readings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch readings" });
  }
});

// Get all coffee readings for a user
router.get("/coffee", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const readings = await CoffeeReading.find({ userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    res.json({ success: true, readings });
  } catch (error) {
    console.error("Error fetching coffee readings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch readings" });
  }
});

// Get all palm readings for a user
router.get("/palm", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const readings = await PalmReading.find({ userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    res.json({ success: true, readings });
  } catch (error) {
    console.error("Error fetching palm readings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch readings" });
  }
});

// Get all dream readings for a user
router.get("/dream", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const readings = await DreamReading.find({ userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    res.json({ success: true, readings });
  } catch (error) {
    console.error("Error fetching dream readings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch readings" });
  }
});

module.exports = router;
