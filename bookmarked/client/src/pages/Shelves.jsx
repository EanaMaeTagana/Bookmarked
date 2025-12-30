import { useEffect, useState } from 'react';
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";
import BackgroundImage from "../assets/images/background-image.png"; 
import EditImage from "../assets/images/edit-icon.png"; 
import '../style/Shelves.css'; 

import HeartFilled from "../assets/images/full-heart.png"; 
import HeartEmpty from "../assets/images/empty-heart.png";   
import TrashIcon from "../assets/images/trash-icon.png";     

const Shelves = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- BOOK MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(""); 
  const [customShelfName, setCustomShelfName] = useState(""); 

  // --- SHELF EDIT MODAL STATE ---
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [targetShelf, setTargetShelf] = useState(""); 
  const [newShelfName, setNewShelfName] = useState(""); 

  const defaultShelves = ["Currently Reading", "Want to Read", "Read"];

  // --- FETCH DATA ---
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

  // ==============================
  //       BOOK ACTIONS
  // ==============================

  const handleDeleteBook = async () => {
    if (!editingBook) return;
    if(!confirm(`Remove "${editingBook.title}" from your library?`)) return;

    try {
      await fetch(`http://localhost:3000/api/bookshelf/${editingBook._id}`, { method: 'DELETE', credentials: 'include' });
      setBooks(books.filter(b => b._id !== editingBook._id));
      setIsModalOpen(false); 
    } catch (err) { console.error(err); }
  };

  const handleToggleHeart = async () => {
    if (!editingBook) return;
    const newStatus = !editingBook.isTopPick;

    const updatedBooks = books.map(b => 
      b._id === editingBook._id ? { ...b, isTopPick: newStatus } : b
    );
    setBooks(updatedBooks);
    setEditingBook({ ...editingBook, isTopPick: newStatus });

    try {
      await fetch(`http://localhost:3000/api/bookshelf/${editingBook._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTopPick: newStatus }),
        credentials: 'include'
      });
    } catch (err) { fetchBooks(); }
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
    } catch (err) { fetchBooks(); }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setSelectedShelf(book.shelf); 
    setCustomShelfName(""); 
    setIsModalOpen(true);
  };

  // ==============================
  //       SHELF ACTIONS
  // ==============================

  const openShelfModal = (shelfName) => {
    setTargetShelf(shelfName);
    setNewShelfName(shelfName);
    setIsShelfModalOpen(true);
  };

  // 1. DELETE SHELF
  const handleDeleteShelf = async () => {
    const confirmMessage = `Are you sure you want to delete the shelf "${targetShelf}"?\n\nAll books in this shelf will be moved to 'Want to Read'.`;
    if (!confirm(confirmMessage)) return;

    try {
      const booksInShelf = books.filter(b => b.shelf === targetShelf);
      
      const updatedBooks = books.map(b => 
        b.shelf === targetShelf ? { ...b, shelf: "Want to Read" } : b
      );
      setBooks(updatedBooks);
      setIsShelfModalOpen(false); 

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
      fetchBooks(); 
    }
  };

  // 2. RENAME SHELF
  const handleRenameShelf = async () => {
    if (!newShelfName.trim()) return alert("Shelf name cannot be empty");
    if (newShelfName === targetShelf) return setIsShelfModalOpen(false); 

    try {
      const booksInShelf = books.filter(b => b.shelf === targetShelf);

      const updatedBooks = books.map(b => 
        b.shelf === targetShelf ? { ...b, shelf: newShelfName.trim() } : b
      );
      setBooks(updatedBooks);
      setIsShelfModalOpen(false);

      await Promise.all(booksInShelf.map(book => 
        fetch(`http://localhost:3000/api/bookshelf/${book._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shelf: newShelfName.trim() }),
          credentials: 'include'
        })
      ));

    } catch (err) {
      console.error("Error renaming shelf:", err);
      fetchBooks();
    }
  };

  const usedShelves = [...new Set(books.map(b => b.shelf))];
  const allShelves = [...new Set([...defaultShelves, ...usedShelves])];

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="container">
      <Header />
      <HorizontalLine />

      <div className="page-container">
        {allShelves.map(shelfName => {
          const shelfBooks = books.filter(b => b.shelf === shelfName);
          
          if (shelfBooks.length === 0 && !defaultShelves.includes(shelfName)) return null; 
          const isCustomShelf = !defaultShelves.includes(shelfName);

          return (
            <div className="shelf-container" key={shelfName}>
              
              <div>

                <div className="shelf-information">

                  <h1 className="shelf-name">{shelfName}</h1>

                  {isCustomShelf && (
                      <img 
                      className="icon-image" 
                      onClick={() => openShelfModal(shelfName)} 
                      title="Edit Shelf Name or Delete" 
                      src={EditImage} 
                      alt="Edit Shelf" />
                  )}

                </div>

                <hr />

              </div>

              {shelfBooks.length > 0 ? (
                
                <div className="books-container">
                  {shelfBooks.map((book) => (
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

                      <img 
                        className="icon-image" 
                        onClick={() => openEditModal(book)}
                        title="Edit Book Shelf" 
                        src={EditImage}
                        alt="Edit Book"
                      />

                    </div>
                  ))}
                </div>

              ) : (
                
                <p className="empty-shelf">
                  This shelf is empty.
                </p>

              )}
            </div>
          );
        })}

            <HorizontalLine />
      </div>

      {/* --- MODAL 1: BOOK EDITING --- */}
      {isModalOpen && editingBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editing "{editingBook.title}"</h3>
            
            <div className="modal-section">
                <label>Move this book to:</label>
                <select 
                  value={selectedShelf} 
                  onChange={(e) => setSelectedShelf(e.target.value)}
                >
                  {allShelves.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="custom">+ Create a New Shelf</option>
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
            </div>

            <div className="modal-actions-list">
              
              {/* HEART ICON BUTTON */}
              <img 
                src={editingBook.isTopPick ? HeartFilled : HeartEmpty} 
                  onClick={handleToggleHeart}
                  alt="Heart" 
                  className="icon-image"
                  title={editingBook.isTopPick ? "Remove from Favorites" : "Add to Favorites"}/>

              {/* TRASH ICON BUTTON */}
              <img 
                src={TrashIcon} 
                onClick={handleDeleteBook}
                className="icon-image"
                title="Delete Book"
                alt="Delete"/>

            </div>

            <hr />

            <div className="modal-footer">

              <button className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>

              <button className="button" onClick={handleSaveShelf}>Save Changes</button>

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SHELF EDITING --- */}
      {isShelfModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editing Shelf: "{targetShelf}"</h3>
            
            <div className="modal-section">
              <label>Rename this shelf to:</label>
              <input 
                type="text" 
                value={newShelfName} 
                onChange={(e) => setNewShelfName(e.target.value)}/>
            </div>

            <div className="modal-actions-list shelf-modal">

              <img 
                src={TrashIcon} 
                onClick={handleDeleteShelf}
                className="icon-image"
                title="Delete Shelf"
                alt="Delete"/>

              <p>(Books will be moved to 'Want to Read')</p>

            </div>

            <hr />

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsShelfModalOpen(false)}>Cancel</button>
              <button className="button" onClick={handleRenameShelf}>Save Name</button>
            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Shelves;