import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import axios from "axios";
import "./BookDetails.css"; 

function BookDetails() {
  const { olid } = useParams(); 
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchBookAndAuthors = async () => {
      try {
        setLoading(true);
        setError(null);

        const bookRes = await axios.get(`https://openlibrary.org/works/${olid}.json`);
        const bookData = bookRes.data;
        let authorNames = [];

        if (bookData.authors && bookData.authors.length > 0) {
          const authorPromises = bookData.authors.map(authorObj => {
            const authorKey = authorObj.author.key; 
            return axios.get(`https://openlibrary.org${authorKey}.json`)
              .then(res => res.data.name) 
              .catch(err => {
                console.warn(`Failed to fetch name for author key: ${authorKey}`, err.message);
                return "Author Unavailable"; 
              });
          });

          authorNames = await Promise.all(authorPromises);
        }

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

  const addToBookshelf = async () => {
    try {
      setIsAdding(true);
      
      const coverUrl = book.covers 
        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg` 
        : "https://via.placeholder.com/150"; 

      const payload = {
        bookId: olid,                 
        title: book.title,            
        authors: book.authorNames,    
        coverImage: coverUrl,        
      };

      await axios.post("http://localhost:3000/api/bookshelf/add", payload, {
        withCredentials: true 
      });

      alert("✅ Book added to your shelf successfully!");

    } catch (err) {
      console.error("Error adding book:", err);
      
      if (err.response) {
        if (err.response.status === 400) {
          alert("⚠️ You already have this book in your library!");
        } 
        else if (err.response.status === 401 || err.response.status === 403) {
          alert("Please login to add books to your shelf.");
        } 
        else {
          alert(err.response.data?.error || "Failed to add book. Please try again.");
        }
      } else {
        alert("❌ Network Error: Could not reach the server.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">Book not found.</div>;

  const coverId = book.covers ? book.covers[0] : null;
  const title = book.title || "Untitled";
  const authors = book.authorNames ? book.authorNames.join(", ") : "Unknown author";
  const publishYear = book.first_publish_date || "Unknown year";
  
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
            <h3>By: {authors}</h3>
            <p><strong>First Published:</strong> {publishYear}</p>
            
            <button 
              className="add-btn" 
              onClick={addToBookshelf} 
              disabled={isAdding}
              style={{ margin: "20px 0", padding: "10px 20px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}
            >
              {isAdding ? "Adding..." : "Add to Bookshelf"}
            </button>

            <p className="description">{description}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookDetails;