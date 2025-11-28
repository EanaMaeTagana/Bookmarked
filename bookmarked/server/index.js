import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json';

// IMPORTANT: Ensure CORS is enabled if you haven't done so in your existing server file
app.use(cors());
app.use(express.json());

// API endpoint to search books
// This version is a DUMB PROXY: it forwards ALL query parameters directly to Open Library
app.get('/api/search-books', async (req, res) => {
    // req.query now contains q, page, limit, subject, etc.
    // We construct the query string from the received parameters.
    const queryString = new URLSearchParams(req.query).toString();

    if (!queryString) {
        return res.status(400).json({ error: 'Search query or subject is required.' });
    }

    try {
        // Construct the full Open Library API URL, including all forwarded parameters
        const apiUrl = `${OPEN_LIBRARY_BASE_URL}?${queryString}`;
        console.log(`[BACKEND LOG] Forwarding to Open Library: ${apiUrl}`);

        // Use the native global fetch
        const response = await fetch(apiUrl);
        
        // Check for non-OK response from Open Library
        if (!response.ok) {
            console.error(`[BACKEND ERROR] Open Library API returned non-OK status: ${response.status}`);
            throw new Error(`External API failed with status ${response.status}`);
        }

        const data = await response.json();

        // Send the data back to the client
        res.json(data);
    } catch (error) {
        console.error('[BACKEND FINAL ERROR]:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from the external API.' });
    }
});

// IMPORTANT: Make sure your server.listen is running
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});