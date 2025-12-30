const mongoose = require('mongoose');

const BookshelfSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Standard Book Data
  bookId: { type: String, required: true },
  title: { type: String, required: true },
  authors: [String], 
  coverImage: String,
  
  // Shelf Organization
  shelf: { 
    type: String, 
    default: 'Want to Read' 
  },
  
  // --- DIARY & JOURNAL FIELDS ---
  notes: { type: String, default: '' }, 
  quotes: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 10, default: 0 }, 
  dateRead: { type: Date }, 
  isTopPick: { type: Boolean, default: false },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bookshelf', BookshelfSchema);