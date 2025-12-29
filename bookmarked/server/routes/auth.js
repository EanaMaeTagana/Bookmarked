const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/Users.js'); 

// --- 1. GOOGLE LOGIN ---
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // ⚠️ Forces Google to show the account chooser
  })
);

// --- 2. GOOGLE CALLBACK (The Traffic Cop) ---
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // ⚠️ THE FIX: Check if Passport flagged them as "New"
    if (req.user.isNew) {
      // Deleted or New User -> Send to Nickname Page
      console.log("User is new/deleted. Redirecting to onboarding...");
      res.redirect('http://localhost:5173/create-profile');
    } else {
      // Existing User -> Send to Dashboard
      console.log("User found. Redirecting to dashboard...");
      res.redirect('http://localhost:5173/dashboard');
    }
  }
);

// --- 3. NEW: COMPLETE PROFILE (Saves the Nickname) ---
router.post('/create-profile', async (req, res) => {
  // Security check: Must have a Google session pending
  if (!req.user || !req.user.googleId) {
    return res.status(401).json({ error: "Unauthorized. Please login with Google first." });
  }

  try {
    const { nickname } = req.body;

    // Create the REAL user in MongoDB
    const newUser = await User.create({
      googleId: req.user.googleId,
      email: req.user.email,
      avatar: req.user.avatar, // Comes from the temp session
      nickname: nickname,      // The important part!
      displayName: nickname    // Fallback for displayName
    });

    // Manually log them in to replace the "Temp" session with the "Real" one
    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      res.json({ success: true, user: newUser });
    });

  } catch (err) {
    console.error("Creation Error:", err);
    res.status(500).json({ error: "Could not create account" });
  }
});

// --- LOGOUT ROUTE ---
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    // Destroy session to be safe
    req.session.destroy(() => {
      res.redirect('http://localhost:5173/');
    });
  });
});

// --- GET CURRENT USER ---
router.get('/user', (req, res) => {
  res.send(req.user || null);
});

// --- UPDATE PROFILE ROUTE ---
router.put('/update-profile', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Added nickname here so you can edit it on the dashboard later
    if (req.body.nickname !== undefined) user.nickname = req.body.nickname;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.favoriteGenre !== undefined) user.favoriteGenre = req.body.favoriteGenre;
    if (req.body.goal !== undefined) user.goal = req.body.goal;

    await user.save();
    res.json(user);

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

module.exports = router;