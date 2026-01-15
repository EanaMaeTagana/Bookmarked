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

// Database Connection 
// connects the server to the MongoDB atlas cluster using the URI from environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => {}) // connection successful
  .catch(err => {}); // handles connection errors

// Middleware Configuration 
// enables Cross-Origin Resource Sharing for the React frontend
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// parses incoming JSON payloads
app.use(express.json());

// initializes session management for persistent user logins
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// integrates Passport for Google OAuth authentication
app.use(passport.initialize());
app.use(passport.session());

// Route Handlers
// maps specific URL paths to their respective route modules
app.use('/auth', authRoutes);
app.use('/api/bookshelf', bookshelfRoute);
app.use('/api/admin', adminRoutes); 

// Search Proxy Logic
// acts as a bridge between the frontend and the Open Library API to avoid CORS issues
app.get('/api/search-books', async (req, res) => {
    const queryString = new URLSearchParams(req.query).toString();
    if (!queryString) return res.status(400).json({ error: 'Query required.' });

    try {
        const response = await fetch(`${OPEN_LIBRARY_BASE_URL}?${queryString}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Server Initialization
app.listen(PORT, () => {
    // server is active
});