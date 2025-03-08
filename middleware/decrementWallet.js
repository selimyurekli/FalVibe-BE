const { FORTUNE_COSTS } = require("../constants/GeneralConstants");

const decrementWallet = (fortuneType) => async (req, res, next) => {
  try {
    const user = req.userData;
    user.wallet -= FORTUNE_COSTS[fortuneType];
    await user.save();
    next();
  } catch (error) {
    console.error("Wallet decrement error:", error);
    next();
  }
};

module.exports = decrementWallet;
