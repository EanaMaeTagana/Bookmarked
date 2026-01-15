const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/Users.js'); 

// --- 1. GOOGLE LOGIN ---
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' 
  })
);

// --- 2. GOOGLE CALLBACK (The Traffic Cop) ---
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user.isNew) {
      console.log("User is new/deleted. Redirecting to onboarding...");
      res.redirect('http://localhost:5173/create-profile');
    } else {
      console.log("User found. Redirecting to dashboard...");
      res.redirect('http://localhost:5173/dashboard');
    }
  }
);

// --- 3. COMPLETE PROFILE (Saves the Nickname) ---
router.post('/create-profile', async (req, res) => {
  if (!req.user || !req.user.googleId) {
    return res.status(401).json({ error: "Unauthorized. Please login with Google first." });
  }

  try {
    const { nickname } = req.body;
    const newUser = await User.create({
      googleId: req.user.googleId,
      email: req.user.email,
      avatar: req.user.avatar, 
      nickname: nickname,      
      displayName: nickname    
    });

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      res.json({ success: true, user: newUser });
    });

  } catch (err) {
    console.error("Creation Error:", err);
    res.status(500).json({ error: "Could not create account" });
  }
});

// --- 4. DELETE ACCOUNT (New) ---
router.delete('/delete-account', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(req.user._id);

    // Destroy the session and logout
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed during deletion" });
      
      req.session.destroy(() => {
        res.clearCookie('connect.sid'); // Clears session cookie
        res.json({ success: true, message: "Account deleted" });
      });
    });

  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ error: "Could not delete account" });
  }
});

// --- LOGOUT ROUTE ---
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
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