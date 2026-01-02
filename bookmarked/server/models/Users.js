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
  nickname: {
    type: String,
    required: true, 
    default: "Reader"
  },
  avatar: {
    type: String
  },
  displayName: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  bio: { 
    type: String, 
    default: "Ready to start reading?" 
  },
  favoriteGenre: { 
    type: String, 
    default: "Exploring." 
  },
  goal: { 
    type: Number, 
    default: 10 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);