import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";
import BackgroundImage from "../assets/images/background-image.png"; 
import EditImage from "../assets/images/edit-icon.png"; 
import '../style/Shelves.css'; 

import HeartFilled from "../assets/images/full-heart.png"; 
import HeartEmpty from "../assets/images/empty-heart.png";   
import TrashIcon from "../assets/images/trash-icon.png";     

const Shelves = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(""); 
  const [customShelfName, setCustomShelfName] = useState(""); 

  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [targetShelf, setTargetShelf] = useState(""); 
  const [newShelfName, setNewShelfName] = useState(""); 

  const defaultShelves = ["Currently Reading", "Want to Read", "Read"];

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const userRes = await fetch('http://localhost:3000/auth/user', { credentials: 'include' });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData && userData.email) {
          setUser(userData);
          const bookRes = await fetch('http://localhost:3000/api/bookshelf', { credentials: 'include' });
          const bookData = await bookRes.json();
          setBooks(Array.isArray(bookData) ? bookData : []);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) { 
      console.error(err); 
      setUser(null);
    } finally { 
      setLoading(false); 
    }
  };

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
    if (!editingBook.isTopPick) {
        const currentHearts = books.filter(b => b.isTopPick).length;
        if (currentHearts >= 4) {
            alert("You can only select 4 Top Picks! Please remove one before adding another.");
            return;
        }
    }
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
    } catch (err) { checkAuthAndFetch(); }
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
    } catch (err) { checkAuthAndFetch(); }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setSelectedShelf(book.shelf); 
    setCustomShelfName(""); 
    setIsModalOpen(true);
  };

  const openShelfModal = (shelfName) => {
    setTargetShelf(shelfName);
    setNewShelfName(shelfName);
    setIsShelfModalOpen(true);
  };

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
      checkAuthAndFetch(); 
    }
  };

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
      checkAuthAndFetch();
    }
  };

  const usedShelves = [...new Set(books.map(b => b.shelf))];
  const allShelves = [...new Set([...defaultShelves, ...usedShelves])];

  if (loading) return <div className="loading">Loading Library...</div>;

  if (!user) {
    return (
      <div className="container bounce-message">
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your library.</p>
        <button className="button bounce-button" onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
        Login with Google
        </button>
      </div>
    );
  }

  if (books.length === 0) {
      return (
        <div className="container">
            <Header />
            <HorizontalLine />
            <div className="page-container">
                <h1 className="section-title">MY LIBRARY</h1>
                <hr />
                <div className="bounce-message">
                    <h2>Your library is looking a little light!</h2>
                    <p>Start adding books to populate your shelves.</p>
                    <Link to="/search" className="button bounce-button">
                        Start Exploring
                    </Link>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="shelves-page-wrapper">
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
                <div className="books-container shelves-container">
                  {shelfBooks.map((book) => {

                    const linkId = book.bookId || book.openLibraryId || (book.key ? book.key.replace("/works/", "") : null);

                    return (
                      <div key={book._id} className="book-card">
                        
                        <Link 
                          to={linkId ? `/book/${linkId}` : "#"} 
                          onClick={(e) => { if(!linkId) e.preventDefault(); }}
                        >
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
                        </Link>

                        <img 
                          className="icon-image" 
                          onClick={() => openEditModal(book)}
                          title="Edit Book Shelf" 
                          src={EditImage}
                          alt="Edit Book"
                        />

                      </div>
                    );
                  })}
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

      {isModalOpen && editingBook && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>Editing "{editingBook.title}"</h3>

            <div>

                <label>Move this book to:</label>
                <select value={selectedShelf} onChange={(e) => setSelectedShelf(e.target.value)}>
                  {allShelves.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="custom">+ Create a New Shelf</option>
                </select>

                {selectedShelf === "custom" && (
                <input type="text" placeholder="Enter new shelf name..." autoFocus value={customShelfName} onChange={(e) => setCustomShelfName(e.target.value)} />
                )}

            </div>

            <div className="modal-actions-list">
              <img src={editingBook.isTopPick ? HeartFilled : HeartEmpty} onClick={handleToggleHeart} alt="Heart" className="icon-image" />
              <img src={TrashIcon} onClick={handleDeleteBook} className="icon-image" alt="Delete"/>
            </div>
            <hr />
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="button" onClick={handleSaveShelf}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {isShelfModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editing Shelf: "{targetShelf}"</h3>
            <div>
              <label>Rename this shelf to:</label>
              <input type="text" value={newShelfName} onChange={(e) => setNewShelfName(e.target.value)}/>
            </div>
            <div className="modal-actions-list shelf-modal">
              <img src={TrashIcon} onClick={handleDeleteShelf} className="icon-image" alt="Delete"/>
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