const mongoose = require('mongoose');

const BookshelfSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  bookId: { type: String, required: true },
  title: { type: String, required: true },
  authors: [String], 
  coverImage: String,
  
  shelf: { 
    type: String, 
    default: 'Want to Read' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bookshelf', BookshelfSchema);