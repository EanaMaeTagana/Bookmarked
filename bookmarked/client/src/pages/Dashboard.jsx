import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackgroundImage from "../assets/images/background-image.png"; 
import HorizontalLine from "../components/HorizontalLine.jsx";
import EditImage from "../assets/images/edit-icon.png"; 
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nickname: "", 
    bio: "",
    favoriteGenre: "",
    goal: 0 
  });

  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); 
  const [diaryForm, setDiaryForm] = useState({
    notes: "",
    quotes: "",
    rating: 0,
    dateRead: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await axios.get('http://localhost:3000/auth/user', { withCredentials: true });
      
      if (userRes.data && userRes.data.email) {
        setUser(userRes.data);
        
        setProfileForm({
          nickname: userRes.data.nickname || "", 
          bio: userRes.data.bio || "",
          favoriteGenre: userRes.data.favoriteGenre || "",
          goal: userRes.data.goal 
        });
      } else {
        setUser(null);
      }

      const bookRes = await axios.get('http://localhost:3000/api/bookshelf', { withCredentials: true });
      setBooks(bookRes.data);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setUser(null); 
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('http://localhost:3000/auth/update-profile', profileForm, { withCredentials: true });
      setUser(res.data); 
      setIsProfileModalOpen(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const openEditDiary = (book) => {
    setEditingEntry(book);
    setDiaryForm({
      notes: book.notes || "",
      quotes: book.quotes || "",
      rating: book.rating || 0,
      dateRead: book.dateRead ? book.dateRead.split('T')[0] : ""
    });
    setIsDiaryModalOpen(true);
  };

  const handleSaveDiary = async () => {
    if (!editingEntry) return;
    try {
      const updatedBooks = books.map(b => 
        b._id === editingEntry._id ? { ...b, ...diaryForm } : b
      );
      setBooks(updatedBooks);
      setIsDiaryModalOpen(false);

      await axios.put(`http://localhost:3000/api/bookshelf/${editingEntry._id}`, diaryForm, { withCredentials: true });

    } catch (err) {
      console.error(err);
      fetchData(); 
    }
  };

  const handleDeleteEntry = async () => {
    if (!editingEntry) return;
    if (!confirm("Are you sure? This will remove this entry from your diary (but keep the book in your library).")) return;

    try {
      const emptyData = { notes: "", quotes: "", rating: 0, notes: "", dateRead: null };
      
      const updatedBooks = books.map(b => 
        b._id === editingEntry._id ? { ...b, ...emptyData } : b
      );
      setBooks(updatedBooks);
      setIsDiaryModalOpen(false);

      await axios.put(`http://localhost:3000/api/bookshelf/${editingEntry._id}`, emptyData, { withCredentials: true });

    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  if (!user) {
    return (
      <div className="bounce-message">
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your dashboard.</p>
        <button className="button bounce-button" onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
        Login with Google
        </button>
      </div>
    );
  }

  // --- FILTER LOGIC ---
  const topFour = books.filter(b => b.isTopPick === true).slice(0, 4);
  const diaryEntries = books.filter(b => b.notes || b.quotes || b.rating > 0);
  const totalReadCount = books.filter(b => b.shelf === 'Read' || b.shelf === 'Completed').length;

  // --- 🆕 MASONRY LOGIC: Split items into Left (Even) and Right (Odd) ---
  const leftColumn = diaryEntries.filter((_, index) => index % 2 === 0);
  const rightColumn = diaryEntries.filter((_, index) => index % 2 !== 0);

  // --- HELPER FUNCTION: Renders a single card (Keeps code clean) ---
  const renderDiaryCard = (entry) => (
    <div key={entry._id} className="diary-card">

      <div className='diary-content-top'>
        <div className="entry-cover">
          <img src={entry.coverImage} alt={entry.title} />
        </div>
        <div className="entry-details">
          <h3 className='entry-title'>{entry.title}</h3>
          <p className='entry-notes'>{entry.notes}</p>
          <p className='entry-date'>{entry.dateRead ? new Date(entry.dateRead).toLocaleDateString() : ""}</p>
        </div>
      </div>

      <div className="diary-content-bottom">
        {entry.quotes && <p><strong>Quotes:</strong><br />{entry.quotes}</p>}
        {entry.rating > 0 && <p><strong>Rating:</strong> {entry.rating}/10</p>}
      </div>

      <img 
        className="icon-image edit-diary-button" 
        onClick={() => openEditDiary(entry)}
        title="Edit or Delete Entry" 
        src={EditImage}
        alt="Edit Diary"
      />
    </div>
  );

  return (
    <div className="container">
      
      <header>
        <h1 className="greeting">
          HEY, {user.nickname ? user.nickname : (user.displayName ? user.displayName.toUpperCase().split(' ')[0] : 'READER')}
        </h1>

        <div className="account-stats">
          <div className="stat-left">
            <p>{user.bio ||""}</p>
            <p><span>Favorite Genre:</span> {user.favoriteGenre || ""}</p>
          </div>
          <div className="stat-right">
            <p><span>Goal:</span> {user.goal || 0}</p>
            <p><span>Total Read:</span> {totalReadCount}</p>
          </div>
        </div>

        <div className="user-settings">  
          <button className="button" onClick={() => setIsProfileModalOpen(true)}>
            Account Settings
          </button>
          {user.role === 'admin' && (
            <button className="button admin-button" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
        </div>
      </header>

      <section className="top-four-container">
        <h1 className="section-title">My Top 4</h1>
        <hr />
        <div className="books-container">
          {topFour.map((book) => (
            <div key={book._id} className="book-card">
              <div
                className="book-cover-wrapper"
                style={{ backgroundImage: `url(${BackgroundImage})` }}
              >
                <img 
                  src={book.coverImage || "https://placehold.co/128x190"} 
                  alt={book.title}
                  onError={(e) => { e.target.src = "https://placehold.co/128x190"; }}
                />
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p>{book.authors?.[0] || "Unknown"}</p>
              </div>
            </div>
          ))}
        </div>
        {topFour.length === 0 && (
          <p className="empty-message">Heart books in your shelves to see them here!</p>
        )}
      </section>

      <HorizontalLine />

      <section>
        <h1 className="section-title">Reading Diary</h1>
        <hr />
        
        {diaryEntries.length === 0 ? (
          <p className="empty-message">No diary entries yet. Fill out the "Digital Diary" form on a book page!</p>
        ) : (
          <div className="diary-masonry-feed">
            
            <div className="masonry-column">
              {leftColumn.map(renderDiaryCard)}
            </div>

            <div className="masonry-column">
              {rightColumn.map(renderDiaryCard)}
            </div>

          </div>
        )}
      </section>

      <HorizontalLine />

      {/* --- MODAL 1: EDIT PROFILE --- */}

      {isProfileModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content">
            
            <h3>Editing Profile</h3>

            <label>Nickname:</label>
            <input 
              type="text" 
              value={profileForm.nickname} 
              onChange={(e) => setProfileForm({...profileForm, nickname: e.target.value})} 
              placeholder="Display Name"
            />

            <label>Short Bio:</label>
            <input type="text" value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} />
            
            <label>Genres:</label>
            <input type="text" value={profileForm.favoriteGenre} onChange={(e) => setProfileForm({...profileForm, favoriteGenre: e.target.value})} />
            
            <label>Goal:</label>
            <input type="number" value={profileForm.goal} onChange={(e) => setProfileForm({...profileForm, goal: e.target.value})} />
            
            <div className="modal-actions">
              <button onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
              <button onClick={handleSaveProfile} style={{background: '#4a6fa5', color: 'white', border: 'none'}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT DIARY ENTRY --- */}
      {isDiaryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '500px'}}>
            <h3>Edit Entry: {editingEntry?.title}</h3>
            
            <label>Notes:</label>
            <textarea rows="3" value={diaryForm.notes} onChange={(e) => setDiaryForm({...diaryForm, notes: e.target.value})} style={{width: '100%', padding:'10px', marginBottom: '10px'}} />
            
            <label>Quotes:</label>
            <textarea rows="2" value={diaryForm.quotes} onChange={(e) => setDiaryForm({...diaryForm, quotes: e.target.value})} style={{width: '100%', padding:'10px', marginBottom: '10px'}} />
            
            <div style={{display: 'flex', gap: '20px'}}>
              <div style={{flex: 1}}>
                <label>Date Read:</label>
                <input type="date" value={diaryForm.dateRead} onChange={(e) => setDiaryForm({...diaryForm, dateRead: e.target.value})} />
              </div>
              <div style={{flex: 1}}>
                <label>Rating (0-10):</label>
                <input type="number" min="0" max="10" value={diaryForm.rating} onChange={(e) => setDiaryForm({...diaryForm, rating: e.target.value})} />
              </div>
            </div>

            <div className="modal-actions" style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
              <button onClick={handleDeleteEntry} style={{color: 'red', border: '1px solid red', background: 'white'}}>🗑 Delete Entry</button>
              
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => setIsDiaryModalOpen(false)}>Cancel</button>
                <button onClick={handleSaveDiary} style={{background: '#4a6fa5', color: 'white', border: 'none'}}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;