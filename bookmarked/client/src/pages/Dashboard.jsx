import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PROFILE EDIT STATE ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nickname: "", 
    bio: "",
    favoriteGenre: "",
    goal: 100
  });

  // --- DIARY EDIT STATE ---
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); 
  const [diaryForm, setDiaryForm] = useState({
    memorableScene: "",
    quotes: "",
    rating: 0,
    dateRead: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get User
      const userRes = await axios.get('http://localhost:3000/auth/user', { withCredentials: true });
      setUser(userRes.data);
      
      setProfileForm({
        nickname: userRes.data.nickname || "", 
        bio: userRes.data.bio || "Book Lover <3",
        favoriteGenre: userRes.data.favoriteGenre || "Romance, Fantasy, Literature",
        goal: userRes.data.goal || 100
      });

      // 2. Get Books
      const bookRes = await axios.get('http://localhost:3000/api/bookshelf', { withCredentials: true });
      setBooks(bookRes.data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- PROFILE ACTIONS ---
  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('http://localhost:3000/auth/update-profile', profileForm, { withCredentials: true });
      setUser(res.data); 
      setIsProfileModalOpen(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  // --- DIARY ACTIONS ---
  const openEditDiary = (book) => {
    setEditingEntry(book);
    setDiaryForm({
      memorableScene: book.memorableScene || "",
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
      const emptyData = { memorableScene: "", quotes: "", rating: 0, notes: "", dateRead: null };
      
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

  // --- FILTER LOGIC ---
  const topFour = books.filter(b => b.isTopPick === true).slice(0, 4);
  const diaryEntries = books.filter(b => b.memorableScene || b.quotes || b.rating > 0 || b.notes);
  const totalReadCount = books.filter(b => b.shelf === 'Read' || b.shelf === 'Completed').length;

  return (
    <div className="dashboard-container">
      
      {/* HEADER */}
      <header className="dash-header">
        <div className="top-nav-links">
          <span onClick={() => navigate('/')}>HOME</span>
          <span onClick={() => navigate('/search')}>SEARCH</span>
          <span onClick={() => navigate('/shelves')}>SHELF</span>
          <span className="active">DASHBOARD</span>
        </div>

        {/* 🆕 UPDATED: Uses nickname if available, falls back to displayName or 'READER' */}
        <h1 className="greeting">
          HEY, {user?.nickname ? user.nickname.toUpperCase() : (user?.displayName ? user.displayName.toUpperCase().split(' ')[0] : 'READER')}
        </h1>

        <div className="stats-pill">
          <div className="stat-left">
            <strong>{user?.bio?.toUpperCase() || "BOOK LOVER <3"}</strong><br/>
            <span>FAVORITE GENRE: {user?.favoriteGenre?.toUpperCase() || "ROMANCE, FANTASY"}</span>
          </div>
          <div className="stat-right">
            <strong>GOAL: {user?.goal || 100}</strong><br/>
            <span>TOTAL READ: {totalReadCount}</span>
          </div>
        </div>

        {/* --- BUTTONS CONTAINER --- */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
          
          <button className="settings-btn" onClick={() => setIsProfileModalOpen(true)}>
            ACCOUNT SETTINGS
          </button>

          {user?.role === 'admin' && (
            <button 
              className="settings-btn" 
              style={{ backgroundColor: 'black', color: 'white' }} 
              onClick={() => navigate('/admin')}
            >
              ADMIN PANEL
            </button>
          )}

        </div>
      </header>

      <section className="top-four-section">
        <h2 className="section-title">MY TOP 4</h2>
        <div className="top-four-grid">
          {topFour.map((book) => (
            <div key={book._id} className="top-book-card">
              <div className="arch-frame">
                <img src={book.coverImage} alt={book.title} onError={(e) => {e.target.src="https://via.placeholder.com/150"}}/>
              </div>
              <h3>{book.title.toUpperCase()}</h3>
              <p>{book.authors[0]?.toUpperCase()}</p>
            </div>
          ))}
          {topFour.length === 0 && <p style={{color: '#888', fontStyle: 'italic'}}>Heart books in your shelves to see them here!</p>}
        </div>
      </section>

      <div className="flower-divider">
        {'✻ ✽ ✺ ✹ ✸ ✷ ✶ ✴ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋'.split(' ').map((char, i) => <span key={i}>{char}</span>)}
      </div>

      <section className="diary-section">
        <h2 className="section-title">READING DIARY</h2>
        
        <div className="diary-feed">
          {diaryEntries.length === 0 ? (
            <p className="empty-msg">No diary entries yet. Fill out the "Digital Diary" form on a book page!</p>
          ) : (
            diaryEntries.map((entry) => (
              <div key={entry._id} className="diary-entry-card hover-trigger">
                
                <button 
                  className="edit-diary-btn" 
                  onClick={() => openEditDiary(entry)}
                  title="Edit or Delete Entry"
                >
                  ✎
                </button>

                <div className="entry-cover">
                  <img src={entry.coverImage} alt={entry.title} />
                </div>
                <div className="entry-content">
                  <div className="entry-header">
                    <h3>{entry.title.toUpperCase()}</h3>
                    <p className="entry-date">
                      {entry.dateRead ? new Date(entry.dateRead).toLocaleDateString() : ""}
                    </p>
                  </div>
                  {entry.memorableScene && <div className="diary-block"><strong>MEMORABLE SCENE:</strong><p>{entry.memorableScene}</p></div>}
                  {entry.quotes && <div className="diary-block"><strong>QUOTES:</strong><p>"{entry.quotes}"</p></div>}
                  {entry.rating > 0 && <div className="diary-rating"><strong>RATING:</strong> {entry.rating}/10</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- MODAL 1: EDIT PROFILE --- */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            
            {/* 🆕 ADDED NICKNAME INPUT */}
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
            
            <label>Memorable Scene:</label>
            <textarea rows="3" value={diaryForm.memorableScene} onChange={(e) => setDiaryForm({...diaryForm, memorableScene: e.target.value})} style={{width: '100%', padding:'10px', marginBottom: '10px'}} />
            
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