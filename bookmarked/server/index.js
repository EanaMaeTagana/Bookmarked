const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const bookshelfRoute = require('./routes/bookshelf');
const authRoutes = require('./routes/auth');
require('./config/passport'); 

const isAdmin = require('./middleware/isAdmin');

const app = express();
const PORT = process.env.PORT || 3000;
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json';

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MIDDLEWARE ---
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

app.use('/auth', authRoutes);

app.use('/api/bookshelf', bookshelfRoute);

app.get('/api/admin/stats', isAdmin, (req, res) => {
  res.json({ 
    message: "🎉 Welcome Admin! You have access to the secret data.", 
    user: req.user 
  });
});

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});