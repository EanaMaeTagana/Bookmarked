const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/Users.js'); // ⚠️ NEW: Required to update the database

// --- GOOGLE LOGIN ROUTES ---
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// --- LOGOUT ROUTE ---
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('http://localhost:5173/');
  });
});

// --- GET CURRENT USER ---
router.get('/user', (req, res) => {
  res.send(req.user || null);
});

// --- 🆕 UPDATE PROFILE ROUTE (Bio, Goal, Genre) ---
router.put('/update-profile', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

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