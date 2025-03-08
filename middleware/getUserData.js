const User = require("../models/User");

const getUserData = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID" });
    }
    const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    req.userData = user;

    next();
  } catch (error) {
    console.error("Error in getUserData middleware:", error);
    return res.status(500).json({
      message: "Internal server error in getUserData middleware",
      error: error.message,
    });
  }
};

module.exports = getUserData;
