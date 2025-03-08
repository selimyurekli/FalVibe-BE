const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// Auth callback endpoint
router.post("/auth-callback", async (req, res) => {
  try {
    const { email, firstName, lastName, id: clerkId, imageUrl } = req.body;

    // Check if user exists
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        profileImage: imageUrl,
      });
      await user.save();
      console.log("New user created:", user);
    } else {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.profileImage = imageUrl;
      await user.save();
      console.log("User updated:", user);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;