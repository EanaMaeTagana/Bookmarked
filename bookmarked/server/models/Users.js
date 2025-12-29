const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  // ⚠️ UPDATE 1: The new field for the onboarding flow
  nickname: {
    type: String,
    required: true, // We make this required because they MUST set it on the next page
    default: "Reader"
  },
  // ⚠️ UPDATE 2: Google Profile Picture (needed for Dashboard)
  avatar: {
    type: String
  },
  // ⚠️ UPDATE 3: Made optional (removed 'required: true') so it doesn't crash 
  // when we create a user with just a nickname.
  displayName: {
    type: String
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // --- PROFILE FIELDS ---
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