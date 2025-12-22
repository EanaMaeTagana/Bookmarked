import { useState, useEffect, useCallback } from "react"; 
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import axios from "axios";
import "./Search.css"; 

const BACKEND_URL = "http://localhost:3000"; 

const CARD_COLORS = [
  'var(--pastel-purple)',
  'var(--pastel-orange)',
  'var(--pastel-blue)',
  'var(--pastel-red)',
  'var(--pastel-red-two)',
  'var(--pastel-blue-two)',
  'var(--pastel-orange-two)',
  'var(--pastel-purple-two)',
];

function Search() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("fiction");
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);
  const booksPerPage = 20;
  const maxResults = 1000;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => setPage(1), [debouncedQuery, category]);

  const handleSearchSubmit = () => {
    setDebouncedQuery(query);
    setPage(1); 
  };

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    params.append("page", page);
    params.append("limit", booksPerPage);
    
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery.trim());
    } else {
      params.set("subject", category);
    }
    
    return `${BACKEND_URL}/api/search-books?${params.toString()}`;
  }, [page, debouncedQuery, category]);

  const fetchBooks = useCallback(async () => {
    try {
      const url = buildApiUrl();
      const res = await axios.get(url); 
      
      const docs = res.data.docs || [];
      const totalHits = res.data.numFound ? Number(res.data.numFound) : docs.length;
      const total = Math.min(totalHits, maxResults);
      
      const sorted = docs.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
      
      setBooks(sorted); 
      setNumFound(total);
    } catch (err) {
      console.error("Error fetching books from backend proxy:", err.message);
      setBooks([]);
      setNumFound(0);
    }
  }, [buildApiUrl]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const lastPage = Math.min(Math.ceil(numFound / booksPerPage), 50);

  const renderPageButtons = () => {
  if (lastPage <= 1) return null;

  const buttons = [];

  const createButton = (pageNumber) => (
    <button 
      key={pageNumber} 
      onClick={() => setPage(pageNumber)} 
      className={pageNumber === page ? "active" : ""}
    >
      {pageNumber}
    </button>
  );

  buttons.push(
    <button 
      key="prev" 
      onClick={() => setPage(page - 1)} 
      disabled={page === 1}
      className="nav-btn"
    >
      « Prev
    </button>
  );

  const pagesToShow = new Set();
  
  pagesToShow.add(1); 
  
  if (page > 1) {
    pagesToShow.add(page - 1);
  }
  
  pagesToShow.add(page); 
  
  if (page < lastPage) {
    pagesToShow.add(page + 1);
  }

  if (lastPage > 1) {
    pagesToShow.add(lastPage); 
  }

  const sortedPages = [...pagesToShow].sort((a, b) => a - b);
  let prevPage = 0;

  sortedPages.forEach(pageNumber => {
    if (pageNumber > prevPage + 1 && prevPage !== 0) {
      buttons.push(<span key={`ell-${pageNumber}`} className="ellipsis">…</span>);
    }
    
    buttons.push(createButton(pageNumber));
    prevPage = pageNumber;
  });

  buttons.push(
    <button 
      key="next" 
      onClick={() => setPage(page + 1)} 
      disabled={page === lastPage}
      className="nav-btn"
    >
      Next »

    </button>
  );
  
  return buttons;
};

  return (
    
    <div className="container">

      <Header />

      <HorizontalLine />

      <h1 className="section-title">Search</h1>

      <hr />
      
      <div className="search-controls"> 
        <input 
          type="text" 
          placeholder="Search books by title or author..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(); 
            }
          }}
        /> 
        <div className="genre-filters">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          > 
            <option value="fiction">ALL</option> 
            <option value="romance">ROMANCE</option> 
            <option value="mystery">MYSTERY</option> 
            <option value="fantasy">FANTASY</option> 
            <option value="nonfiction">NON-FICTION</option> 
          </select> 
        </div>

      </div> 

      <div className="books-container"> 
        {books.length > 0 ? ( 
          books.map((book, index) => { 
            const coverId = book.cover_i; 
            const authors = book.author_name || []; 

            return ( 
              <Link 
                to={`/book/${book.key.replace("/works/", "")}`} 
                key={book.key || index} 
                className="book-card"
              > 
                <div 
                  className="book-cover-wrapper" 
                  style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
                >
                  {coverId ? ( 
                    <img 
                      src={`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`} 
                      alt={book.title} 
                    /> 
                  ) : ( 
                    <div className="no-cover">
                        No Image
                    </div> 
                  )} 
                </div> 

                <div className="book-details"> 
                    <h3>{book.title}</h3> 
                    <p>{authors.join(", ")}</p> 
                </div>
              </Link>
            ); 
          }) 
        ) : ( 
          <div className="no-results">
            No results found
          </div>
        )} 
      </div> 

      <div className="pagination"> 
        {renderPageButtons()} 
      </div> 
    </div> 
  ); 
} 

export default Search;