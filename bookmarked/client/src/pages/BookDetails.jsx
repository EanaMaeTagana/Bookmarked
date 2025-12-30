import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";
import "../style/BookDetails.css";
import axios from "axios";

function BookDetails() {
  const { olid } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savedBookId, setSavedBookId] = useState(null);

  const [diaryForm, setDiaryForm] = useState({
    notes: "", 
    quotes: "",
    dateRead: "",
    rating: ""
  });

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
            notes: existingBook.notes || existingBook.memorableScene || "", // Handles new or old data
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

  const addToBookshelf = async () => {
    try {
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
      return res.data._id; 
    } catch (err) {
      if (err.response?.status === 400) {
        return savedBookId; 
      }
      throw err;
    }
  };

  const handleSaveDiary = async () => {
    try {
      let currentId = savedBookId;

      if (!currentId) {
        currentId = await addToBookshelf();
        setSavedBookId(currentId);
      }

      await axios.put(`http://localhost:3000/api/bookshelf/${currentId}`, diaryForm, {
        withCredentials: true
      });

      alert("✅ Diary updated successfully!");
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      alert("Error saving diary. Please try again.");
    }
  };

  if (loading) return <div className="loading-screen">Loading Book Details...</div>;
  if (!book) return <div className="error-screen">Book not found.</div>;

  const coverId = book.covers ? book.covers[0] : null;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "https://via.placeholder.com/150";

  return (
    <div className="container">

      <div className="page-container">
        <Header />

        <HorizontalLine />

        <div className="details-section">
          
          <div className="book-cover">
            <img src={coverUrl} alt={book.title} className="simple-book-cover" />
          </div>

          <div className="book-details-info">
            <div>
              <h1 className="book-title">{book.title}</h1>
              <h3 className="book-author">{book.authorNames.join(", ")}</h3>
            </div>
            
            <p className="book-description">
              {typeof book.description === 'string' 
              ? book.description 
              : book.description?.value || "No description available."}
            </p>       
          </div>
        </div>

        {!savedBookId && (
        <button className="button" onClick={async () => {
          try {
              const id = await addToBookshelf();
              setSavedBookId(id);
              alert("✅ Added to shelf!");
          } catch(e) { alert("Error adding book"); }
        }}>
          + ADD TO SHELVES
        </button>
        )}

        <div className="diary-section">
          <h2>Loved this read? <br />Record it in your digital diary.</h2>
              
          <div className="note-form">
            <label>What made this book unputdownable?</label>
            <textarea 
              rows="4"
              value={diaryForm.notes}
              onChange={(e) => setDiaryForm({...diaryForm, notes: e.target.value})}
            />
          </div>

          <div className="quote-form">
            <label>Which quotes stuck with you?</label>
            <textarea 
              rows="4"
              value={diaryForm.quotes}
              onChange={(e) => setDiaryForm({...diaryForm, quotes: e.target.value})}
            />
          </div>

          <div className="date-rating-form">
            <div className="date-form">
              <label>When did you read this book?</label>
              <input 
                type="date"
                value={diaryForm.dateRead}
                onChange={(e) => setDiaryForm({...diaryForm, dateRead: e.target.value})}
                />
            </div>

            <div className="rating-form">
              <label>How would you rate this book? (0-10)</label>
              <input 
                type="number" min="0" max="10"
                value={diaryForm.rating}
                onChange={(e) => setDiaryForm({...diaryForm, rating: e.target.value})}
              />
            </div>
          </div>

        </div>

        <button className="button" onClick={handleSaveDiary}>
          + ADD TO DASHBOARD DIARY
        </button>
      </div>

      <HorizontalLine />

    </div>
    
  );
}

export default BookDetails;