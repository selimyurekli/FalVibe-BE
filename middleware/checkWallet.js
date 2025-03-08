const { FORTUNE_COSTS } = require("../constants/GeneralConstants");

const checkWallet = (fortuneType) => async (req, res, next) => {
  try {
    const user = req.userData;
    const cost = FORTUNE_COSTS[fortuneType];
    
    if (user.wallet < cost) {
      return res.status(403).json({
        message: "Yetersiz FalCoin bakiyesi",
        required: cost,
        current: user.wallet,
      });
    }
    next();
  } catch (error) {
    console.error("Wallet check error:", error);
    res
      .status(500)
      .json({ message: "Bakiye kontrolü sırasında bir hata oluştu" });
  }
};

module.exports = checkWallet;
