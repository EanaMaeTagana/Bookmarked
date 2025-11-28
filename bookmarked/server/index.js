const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Import User Model
const User = require('./models/Users.js'); 

const app = express();
const PORT = process.env.PORT || 3000;
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json';

const isAdmin = require('./middleware/isAdmin');

// --- 1. DATABASE CONNECTION ---
// We need to connect to MongoDB before handling users
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 2. MIDDLEWARE CONFIG ---
// Update CORS to allow cookies/sessions from your React App
app.use(cors({
  origin: 'http://localhost:5173', // Ensure this matches your React URL exactly
  credentials: true // This allows the session cookie to be sent back and forth
}));
app.use(express.json());

// Session Config (Must be before Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using https
}));

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// --- 3. PASSPORT STRATEGY ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      } else {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        });
        return done(null, user);
      }
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

// --- 4. AUTH ROUTES ---

// Login Route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback Route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to React Dashboard
    res.redirect('http://localhost:5173/dashboard');
  }
);

// Logout Route
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return console.error(err); }
    res.redirect('http://localhost:5173/');
  });
});

// Get Current User (Used by React to check login state)
app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

// Admin Only Route
app.get('/api/admin/stats', isAdmin, (req, res) => {
  res.json({ 
    message: "🎉 Welcome Admin! You have access to the secret data.", 
    user: req.user 
  });
});


// --- 5. EXISTING BOOK SEARCH PROXY ---
app.get('/api/search-books', async (req, res) => {
    const queryString = new URLSearchParams(req.query).toString();

    if (!queryString) {
        return res.status(400).json({ error: 'Search query or subject is required.' });
    }

    try {
        const apiUrl = `${OPEN_LIBRARY_BASE_URL}?${queryString}`;
        console.log(`[BACKEND LOG] Forwarding to Open Library: ${apiUrl}`);

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error(`[BACKEND ERROR] Open Library API returned non-OK status: ${response.status}`);
            throw new Error(`External API failed with status ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('[BACKEND FINAL ERROR]:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from the external API.' });
    }
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});