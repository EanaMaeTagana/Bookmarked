const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Route and Config Imports
const bookshelfRoute = require('./routes/bookshelf');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 3000;
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json';

// --------------------
// Database Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

// --------------------
// CORS (FIXED FOR VERCEL)
// --------------------
const FRONTEND_ORIGIN = 'https://bookmarked-frontend.vercel.app';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔴 REQUIRED for preflight requests
app.options('*', cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// --------------------
// Middleware
// --------------------
app.use(express.json());

// --------------------
// Session Management
// --------------------
app.use(session({
  name: 'bookmarked.sid',
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  }
}));

// --------------------
// Passport
// --------------------
app.use(passport.initialize());
app.use(passport.session());

// --------------------
// Routes
// --------------------
app.use('/auth', authRoutes);
app.use('/api/bookshelf', bookshelfRoute);
app.use('/api/admin', adminRoutes);

// --------------------
// Open Library Search Proxy
// --------------------
app.get('/api/search-books', async (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  if (!queryString) {
    return res.status(400).json({ error: 'Query required.' });
  }

  try {
    const response = await fetch(`${OPEN_LIBRARY_BASE_URL}?${queryString}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Open Library error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// --------------------
// Local Dev Server
// --------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// --------------------
// Export for Vercel
// --------------------
module.exports = app;
