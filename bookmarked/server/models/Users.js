const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // --- NEW PROFILE FIELDS ---
  bio: { 
    type: String, 
    default: "Book Lover <3" 
  },
  favoriteGenre: { 
    type: String, 
    default: "Romance, Fantasy, Literature" 
  },
  goal: { 
    type: Number, 
    default: 100 
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);