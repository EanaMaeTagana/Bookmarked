import { useState, useEffect, useCallback } from "react"; 
import { Link } from "react-router-dom";
import axios from "axios";
import BackgroundImage from "../assets/images/background-image.png";
import SearchImage from "../assets/images/search-icon.png";
import Header from "../components/Header.jsx";
import HorizontalLine from "../components/HorizontalLine.jsx";  
import Pagination from "../components/Pagination.jsx"; 
import "../style/Search.css";

const BACKEND_URL = "http://localhost:3000"; 
const BOOKS_PER_PAGE = 20;

function Search() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("fiction");
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);

  // 1. Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 2. Reset page on new search
  useEffect(() => setPage(1), [debouncedQuery, category]);

  // 3. Define the Missing Function
  const handleSearchSubmit = () => {
    setDebouncedQuery(query);
    setPage(1);
  };

  // 4. API Logic
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", BOOKS_PER_PAGE);
    
    if (debouncedQuery.trim()) {
      params.set("q", debouncedQuery.trim());
    } else {
      params.set("subject", category);
    }
    
    return `${BACKEND_URL}/api/search-books?${params.toString()}`;
  }, [page, debouncedQuery, category]);

  // 5. Fetch Logic
  const fetchBooks = useCallback(async () => {
    try {
      const url = buildApiUrl();
      const res = await axios.get(url); 
      
      const docs = res.data.docs || [];
      const totalHits = res.data.numFound ? Number(res.data.numFound) : docs.length;
      
      const sorted = docs.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
      
      setBooks(sorted); 
      setNumFound(Math.min(totalHits, 1000));
    } catch (err) {
      console.error("Error fetching books:", err.message);
      setBooks([]);
    }
  }, [buildApiUrl]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const lastPage = Math.min(Math.ceil(numFound / BOOKS_PER_PAGE), 50);

  return (
    <div className="container">

      <Header />
      <HorizontalLine />
      <h1 className="section-title">Discover</h1>
      <hr />
      
      <div className="search-controls"> 

        <div className="genre-filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}> 
            <option value="fiction">ALL</option> 
            <option value="romance">ROMANCE</option> 
            <option value="mystery">MYSTERY</option> 
            <option value="fantasy">FANTASY</option> 
            <option value="nonfiction">NON-FICTION</option> 
          </select> 
        </div>

        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Search books by title or author..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(); 
            }}
          />
          <img className="icon-image" onClick={handleSearchSubmit}
            src={SearchImage}  
            alt="Search"
          />
        </div>

      </div> 

      <div className="books-container"> 
        {books.length > 0 ? ( 
          books.map((book, index) => ( 
            <Link 
              to={`/book/${book.key.replace("/works/", "")}`} 
              key={book.key || index} 
              className="book-card"
            > 
              <div 
                className="book-cover-wrapper"
                style={{ backgroundImage: `url(${BackgroundImage})` }}
              >
                {book.cover_i ? (
                  <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt={book.title} /> 
                ) : (
                  <div className="no-cover">No Image</div>
                )} 
              </div> 
              <div className="book-details"> 
                  <h3>{book.title}</h3> 
                  <p>{(book.author_name || []).join(", ")}</p> 
              </div>
            </Link>
          )) 
        ) : ( 
          <div className="no-results">No results found</div>
        )} 
      </div> 

      <Pagination page={page} lastPage={lastPage} setPage={setPage} />

    </div> 
  ); 
} 

export default Search;