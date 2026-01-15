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

// connects to the MongoDB atlas cluster using the URI from environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected')) 
  .catch(err => console.error('Connection error:', err));

// enables CORS for both local development and your future Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://your-frontend-name.vercel.app' // update this after your frontend is deployed
  ], 
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// parses incoming JSON payloads
app.use(express.json());

// configures secure cookies for production to ensure login persistence on Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: true, // required for Vercel and other reverse proxies
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' 
  } 
}));

// integrates Passport for Google OAuth authentication
app.use(passport.initialize());
app.use(passport.session());

// maps specific URL paths to their respective route modules
app.use('/auth', authRoutes);
app.use('/api/bookshelf', bookshelfRoute);
app.use('/api/admin', adminRoutes); 

// bridge between the frontend and the Open Library API to avoid CORS issues
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

// only starts the listener if the app is running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// allows Vercel to handle the app as a serverless function
module.exports = app;