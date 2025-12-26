import { useEffect, useState } from 'react';
import './Shelves.css';

const Shelves = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(""); 
  const [customShelfName, setCustomShelfName] = useState(""); 

  const defaultShelves = ["Currently Reading", "Want to Read", "Read"];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/bookshelf', { credentials: 'include' });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- 1. DELETE BOOK (Single Book) ---
  const handleDelete = async (id) => {
    if(!confirm("Remove this book from your library?")) return;
    try {
      await fetch(`http://localhost:3000/api/bookshelf/${id}`, { method: 'DELETE', credentials: 'include' });
      setBooks(books.filter(b => b._id !== id));
    } catch (err) { 
      console.error(err); 
    }
  };

  // --- 2. DELETE SHELF (Custom Shelf Only) ---
  const handleDeleteShelf = async (shelfName) => {
    const confirmMessage = `Are you sure you want to delete the shelf "${shelfName}"?\n\nAll books in this shelf will be moved to 'Want to Read'.`;
    if (!confirm(confirmMessage)) return;

    try {
      const booksInShelf = books.filter(b => b.shelf === shelfName);

      const updatedBooks = books.map(b => 
        b.shelf === shelfName ? { ...b, shelf: "Want to Read" } : b
      );
      setBooks(updatedBooks);

      await Promise.all(booksInShelf.map(book => 
        fetch(`http://localhost:3000/api/bookshelf/${book._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shelf: "Want to Read" }),
          credentials: 'include'
        })
      ));

    } catch (err) {
      console.error("Error deleting shelf:", err);
      alert("Failed to delete shelf properly. Refreshing...");
      fetchBooks(); 
    }
  };

  // --- 3. TOGGLE HEART (Top Pick) ---
  const handleToggleHeart = async (book) => {
    const newStatus = !book.isTopPick;
    const updatedBooks = books.map(b => 
      b._id === book._id ? { ...b, isTopPick: newStatus } : b
    );
    setBooks(updatedBooks);

    try {
      await fetch(`http://localhost:3000/api/bookshelf/${book._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTopPick: newStatus }),
        credentials: 'include'
      });
    } catch (err) {
      console.error("Heart Error:", err);
      fetchBooks(); 
    }
  };

  // --- 4. MOVE MODAL LOGIC ---
  const openMoveModal = (book) => {
    setEditingBook(book);
    setSelectedShelf(book.shelf); 
    setCustomShelfName(""); 
    setIsModalOpen(true);
  };

  const handleSaveShelf = async () => {
    if (!editingBook) return;

    let finalShelfName = selectedShelf;
    
    if (selectedShelf === "custom") {
      if (!customShelfName.trim()) return alert("Please enter a shelf name");
      finalShelfName = customShelfName.trim();
    }

    try {
      const updatedBooks = books.map(b => 
        b._id === editingBook._id ? { ...b, shelf: finalShelfName } : b
      );
      setBooks(updatedBooks);
      setIsModalOpen(false); 

      await fetch(`http://localhost:3000/api/bookshelf/${editingBook._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelf: finalShelfName }),
        credentials: 'include'
      });

    } catch (err) {
      console.error("Failed to move book", err);
      fetchBooks(); 
    }
  };

  // --- CALCULATE SHELVES ---
  const usedShelves = [...new Set(books.map(b => b.shelf))];
  const allShelves = [...new Set([...defaultShelves, ...usedShelves])];

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="shelves-container">
      <h1 style={{ textAlign: 'center', fontSize: '3rem', margin: '20px 0' }}>BOOKMARKED</h1>

      {allShelves.map(shelfName => {
        const shelfBooks = books.filter(b => b.shelf === shelfName);
        
        if (shelfBooks.length === 0 && !defaultShelves.includes(shelfName)) return null; 

        const isCustomShelf = !defaultShelves.includes(shelfName);

        return (
          <div key={shelfName} className="shelf-section">
            
            {/* --- SHELF HEADER WITH DELETE BUTTON --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '2px solid black', paddingBottom: '5px', marginTop: '40px' }}>
              <h2 style={{ margin: 0, border: 'none' }}>{shelfName.toUpperCase()}</h2>
              
              {isCustomShelf && (
                <button 
                  onClick={() => handleDeleteShelf(shelfName)}
                  style={{ 
                    background: 'none', 
                    border: '1px solid #ff4d4d', 
                    color: '#ff4d4d', 
                    borderRadius: '20px', 
                    padding: '5px 10px', 
                    cursor: 'pointer', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                  title="Delete Shelf (Moves books to Want to Read)"
                >
                  ✖ DELETE SHELF
                </button>
              )}
            </div>

            <div className="shelf-grid">
              {shelfBooks.length > 0 ? shelfBooks.map((book) => (
                <div key={book._id} className="book-card">
                  
                  <div className="image-container" style={{ position: 'relative' }}>
                    <img 
                      src={book.coverImage || "https://placehold.co/128x190"} 
                      alt={book.title}
                      className="book-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/128x190"; }}
                    />
                    
                    <div className="delete-overlay">
                      <button className="icon-btn" title="Move to Shelf" onClick={() => openMoveModal(book)}>
                        📂
                      </button>
                      <button className="icon-btn" title="Delete Book" onClick={() => handleDelete(book._id)}>
                        🗑
                      </button>

                      <button 
                         className="icon-btn" 
                         onClick={() => handleToggleHeart(book)}
                         title={book.isTopPick ? "Remove from Top 4" : "Add to Top 4"}
                         style={{ color: book.isTopPick ? '#ff4d4d' : 'white', fontWeight: 'bold' }} 
                       >
                         {book.isTopPick ? '♥' : '♡'}
                       </button>

                    </div>
                  </div>
                  
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>{book.authors?.[0] || "Unknown"}</p>
                  </div>
                </div>
              )) : <p style={{color: '#888', fontStyle: 'italic', marginTop: '20px'}}>Empty shelf</p>}
            </div>
          </div>
        );
      })}

      {/* --- MOVE MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Move "{editingBook.title}"</h3>
            <p>Select a shelf or create a new one:</p>

            <select 
              value={selectedShelf} 
              onChange={(e) => setSelectedShelf(e.target.value)}
            >
              {allShelves.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="custom">+ Create New Shelf...</option>
            </select>

            {selectedShelf === "custom" && (
              <input 
                type="text" 
                placeholder="Enter new shelf name..." 
                autoFocus
                value={customShelfName}
                onChange={(e) => setCustomShelfName(e.target.value)} 
              />
            )}

            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)} style={{padding:'10px 20px'}}>Cancel</button>
              <button 
                onClick={handleSaveShelf}
                style={{padding:'10px 20px', background: 'black', color: 'white', border: 'none'}}
              >
                Save Move
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shelves;