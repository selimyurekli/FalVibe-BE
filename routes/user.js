const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get user wallet info
router.get("/wallet", async (req, res) => {
  try {
    res.json({
      wallet: req.userData.wallet,
      currency: "FalCoin",
    });
  } catch (error) {
    console.error("Error getting wallet info:", error);
    res
      .status(500)
      .json({ message: "Cüzdan bilgisi alınırken bir hata oluştu" });
  }
});

// Update wallet balance after watching ad
router.post("/wallet/reward", async (req, res) => {
  try {
    const user = req.userData;
    const REWARD_AMOUNT = 50; // 50 FalCoin reward for watching ad

    user.wallet += REWARD_AMOUNT;
    await user.save();

    res.json({
      success: true,
      message: "Ödül başarıyla eklendi",
      wallet: user.wallet,
      rewardAmount: REWARD_AMOUNT,
    });
  } catch (error) {
    console.error("Error updating wallet after ad:", error);
    res.status(500).json({
      success: false,
      message: "Ödül eklenirken bir hata oluştu",
    });
  }
});

module.exports = router;
