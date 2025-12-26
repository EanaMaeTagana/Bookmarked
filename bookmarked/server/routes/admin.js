const express = require('express');
const router = express.Router();
const User = require('../models/Users.js');
const Bookshelf = require('../models/Bookshelf.js');

const isAdmin = require('../middleware/isAdmin'); 

router.use(isAdmin); 

// --- 1. GET STATS ---
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookCount = await Bookshelf.countDocuments();
    res.json({ totalUsers: userCount, totalBooks: bookCount });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --- 2. GET USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --- 3. DELETE USER ---
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Bookshelf.deleteMany({ user: req.params.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;