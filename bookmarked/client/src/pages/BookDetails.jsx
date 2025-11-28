import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import axios from "axios";
import "./BookDetails.css"; 

function BookDetails() {
  const { olid } = useParams(); // OLID from URL
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book and author data from OpenLibrary
  useEffect(() => {
    const fetchBookAndAuthors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // --- 1. Fetch Work Details ---
        const bookRes = await axios.get(`https://openlibrary.org/works/${olid}.json`);
        const bookData = bookRes.data;
        let authorNames = [];

        if (bookData.authors && bookData.authors.length > 0) {
          // --- 2. Extract Author Keys and Create Robust Author Fetch Promises ---
          const authorPromises = bookData.authors.map(authorObj => {
            const authorKey = authorObj.author.key; 
            
            // Create the API request promise, adding a catch block for robustness
            return axios.get(`https://openlibrary.org${authorKey}.json`)
              .then(res => res.data.name) // Success: Return the author name
              .catch(err => {
                // Failure: Log the error and return a fallback name
                console.warn(`Failed to fetch name for author key: ${authorKey}`, err.message);
                return "Author Unavailable"; 
              });
          });

          // --- 3. Execute all Author Fetches Concurrently ---
          authorNames = await Promise.all(authorPromises);
        }

        // --- 4. Update State with Book Data and Author Names ---
        setBook({ ...bookData, authorNames: authorNames });
        
      } catch (err) {
        console.error("Error fetching book or author details:", err.message);
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndAuthors();
  }, [olid]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">Book not found.</div>;

  const coverId = book.covers ? book.covers[0] : null;
  const title = book.title || "Untitled";
  
  // FIXED: Authors are now pulled from the authorNames array added to the state
  const authors = book.authorNames ? book.authorNames.join(", ") : "Unknown author";
  
  const publishYear = book.first_publish_date || "Unknown year";
  
  // Cleanly extract description
  const description = book.description
    ? typeof book.description === "string"
      ? book.description
      : book.description.value
    : "No description available.";

  return (
    <div className="container">

      <Header />

      <HorizontalLine />
      
      <div className="book-details-page">
        
        <div className="back-button-row">
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        </div>

        <div className="book-details-container">
          {coverId ? (
            <img
              src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
              alt={title}
              className="book-cover"
            />
          ) : (
            <div className="no-cover">No Cover Image</div>
          )}

          <div className="book-info">
            <h1>{title}</h1>
            {/* FIXED: Authors display as names */}
            <h3>By: {authors}</h3>
            <p><strong>First Published:</strong> {publishYear}</p>
            {/* Subjects field removed */}
            <p className="description">{description}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookDetails;