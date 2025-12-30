import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import axios from "axios";

function BookDetails() {
  const { olid } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [savedBookId, setSavedBookId] = useState(null); 

  const [diaryForm, setDiaryForm] = useState({
    memorableScene: "",
    quotes: "",
    dateRead: "",
    rating: ""
  });

  // 1. Fetch Book Details
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://openlibrary.org/works/${olid}.json`);
        const bookData = res.data;
        
        let authorNames = ["Unknown Author"];
        if (bookData.authors?.length > 0) {
          const authorRes = await axios.get(`https://openlibrary.org${bookData.authors[0].author.key}.json`);
          authorNames = [authorRes.data.name];
        }

        setBook({ ...bookData, authorNames });
        
        const myBooksRes = await axios.get('http://localhost:3000/api/bookshelf', { withCredentials: true });
        const existingBook = myBooksRes.data.find(b => b.bookId === olid);
        
        if (existingBook) {
          setSavedBookId(existingBook._id);
          setDiaryForm({
            memorableScene: existingBook.memorableScene || "",
            quotes: existingBook.quotes || "",
            dateRead: existingBook.dateRead ? existingBook.dateRead.split('T')[0] : "",
            rating: existingBook.rating || ""
          });
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [olid]);

  // 2. Handle "Add to Shelves" (Basic Save)
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
        coverImage: coverUrl
      };

      const res = await axios.post("http://localhost:3000/api/bookshelf/add", payload, { withCredentials: true });
      setSavedBookId(res.data._id); 
      alert("✅ Added to your shelf!");

    } catch (err) {
      if (err.response?.status === 400) {
        alert("⚠️ You already have this book! You can fill out the diary below.");
      } else {
        alert("Error saving book.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Handle "Add to Dashboard Diary" (Update with Details)
  const saveDiaryEntry = async () => {
    if (!savedBookId) {
      alert("Please click 'Add to Shelves' first!");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/bookshelf/${savedBookId}`, diaryForm, {
        withCredentials: true
      });
      alert("✅ Diary entry saved to Dashboard!");
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      alert("Failed to save diary entry.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="error">Book not found.</div>;

  const coverId = book.covers ? book.covers[0] : null;

  return (
    <div className="container">
      <Header />
      <HorizontalLine />
      
      {/* --- TOP SECTION: BOOK INFO --- */}
      <div className="book-details-container" style={{ padding: '40px', display: 'flex', gap: '40px', justifyContent: 'center' }}>
        <img
          src={coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "https://via.placeholder.com/150"}
          alt={book.title}
          style={{ width: '200px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
        />

        <div className="book-info" style={{ maxWidth: '600px' }}>
          <h1 style={{ color: '#4a6fa5', textTransform: 'uppercase', fontSize: '2rem' }}>{book.title}</h1>
          <h3 style={{ fontStyle: 'italic', color: '#666' }}>{book.authorNames.join(", ")}</h3>
          
          <p style={{ lineHeight: '1.6', marginTop: '20px' }}>
            {book.description?.value || book.description || "No description available."}
          </p>

          {!savedBookId && (
            <button 
              onClick={addToBookshelf} 
              disabled={isAdding}
              className="pill-btn"
            >
              {isAdding ? "Adding..." : "+ ADD TO SHELVES"}
            </button>
          )}
        </div>
      </div>

      {/* --- BOTTOM SECTION: DIARY FORM (BLUE) --- */}
      <div className="diary-form-section">
        <h2 className="diary-heading">LOVED THIS READ? RECORD IT IN YOUR DIGITAL DIARY.</h2>
        
        <div className="diary-card-blue">
          
          <label>WHAT WAS THE MOST UNFORGETTABLE SCENE IN THIS BOOK?</label>
          <textarea 
            rows="3"
            value={diaryForm.memorableScene}
            onChange={(e) => setDiaryForm({...diaryForm, memorableScene: e.target.value})}
          />

          <label>WHICH QUOTES FROM THIS BOOK STUCK WITH YOU THE MOST?</label>
          <textarea 
             rows="3"
             value={diaryForm.quotes}
             onChange={(e) => setDiaryForm({...diaryForm, quotes: e.target.value})}
          />

          <div className="form-row">
            <div className="form-group">
              <label>WHEN DID YOU READ THIS BOOK?</label>
              <input 
                type="date" 
                value={diaryForm.dateRead}
                onChange={(e) => setDiaryForm({...diaryForm, dateRead: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>HOW WOULD YOU RATE THIS BOOK? (0-10)</label>
              <input 
                type="number" 
                min="0" max="10"
                value={diaryForm.rating}
                onChange={(e) => setDiaryForm({...diaryForm, rating: e.target.value})}
              />
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="pill-btn" onClick={saveDiaryEntry}>
            + ADD TO DASHBOARD DIARY
          </button>
        </div>
      </div>

    </div>
  );
}

export default BookDetails;