const express = require('express');
const router = express.Router();
const Bookshelf = require('../models/Bookshelf'); 

// --- 1. GET ALL BOOKS ---
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const books = await Bookshelf.find({ user: req.user._id }).sort({ addedAt: -1 });
    res.json(books);

  } catch (err) {
    console.error("❌ GET ERROR:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- 2. ADD A BOOK ---
router.post('/add', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const newBook = new Bookshelf({
      user: req.user._id,
      bookId: req.body.bookId,
      title: req.body.title,
      authors: req.body.authors,
      coverImage: req.body.coverImage,
      shelf: 'Want to Read'
    });

    const savedBook = await newBook.save();
    res.json(savedBook);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You already have this book in your library!" });
    }

    console.error("❌ ADD ERROR:", err.message);
    res.status(500).json({ error: "Server Error: Could not save book." });
  }
});

// --- 3. UPDATE BOOK 
router.put('/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const { shelf, notes, memorableScene, quotes, rating, dateRead, isTopPick } = req.body;

    let book = await Bookshelf.findOne({ _id: req.params.id, user: req.user._id });

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (shelf) book.shelf = shelf;
    if (notes !== undefined) book.notes = notes;
    if (memorableScene !== undefined) book.memorableScene = memorableScene;
    if (quotes !== undefined) book.quotes = quotes;
    if (rating !== undefined) book.rating = rating;
    if (dateRead !== undefined) book.dateRead = dateRead;
    
    if (isTopPick !== undefined) book.isTopPick = isTopPick;

    await book.save();
    res.json(book);

  } catch (err) {
    console.error("❌ UPDATE ERROR:", err.message);
    res.status(500).send('Server Error');
  }
});

// --- 4. DELETE BOOK ---
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const book = await Bookshelf.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    res.json({ msg: 'Book removed' });

  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;