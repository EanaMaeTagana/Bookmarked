import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useLocation } from "react-router-dom";
import LoginImage from "../assets/images/login-icon.png";
import LogoutImage from "../assets/images/logout-icon.png";
import "../style/Navbar.css";

function Navbar({ user, loading }) {
  const [menuOpen, setMenuOpen] = useState(false); 
  const [mobileLinksOpen, setMobileLinksOpen] = useState(false);
  
  const userMenuRef = useRef(); // Specifically for the Login/Logout dropdown
  const mobileNavRef = useRef(); // Specifically for the Hamburger and Nav Links
  
  const location = useLocation();
  const API_BASE_URL = 'http://localhost:3000';

  const handleAuth = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user dropdown if clicking outside its container
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      // Close mobile hamburger menu if clicking outside the hamburger or the links
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setMobileLinksOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileLinksOpen(false);
  }, [location]);

  if (location.pathname === '/create-profile') {
    return null; 
  }

  return (
    <nav>
      {/* Wrap Hamburger and Links in a ref to detect outside clicks */}
      <div className="mobile-nav-container" ref={mobileNavRef}>
        <button 
          className="hamburger" 
          onClick={() => setMobileLinksOpen(!mobileLinksOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`bar ${mobileLinksOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileLinksOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileLinksOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${mobileLinksOpen ? "mobile-active" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/shelves">Shelves</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>

      <div className="nav-actions" ref={userMenuRef}>
        {loading ? (
            <div className="nav-spinner"></div>
        ) : (
            <img 
            className="icon-image"
            src={!user ? LoginImage : LogoutImage} 
            alt="User Menu"
            onClick={() => setMenuOpen(!menuOpen)}
            />
        )}

        {menuOpen && (
          <div className="dropdown-menu">
            {!user ? (
              <div className="auth-dropdown-content">
                <p className="dropdown-label">Join Bookmarked</p>
                <button className="continue-button" onClick={handleAuth}>
                  Continue with Google
                </button>
              </div>
            ) : (
              <div className="auth-dropdown-content">
                <p className="dropdown-label">User: {user.nickname || user.displayName}</p>
                <button className="logout-button" onClick={() => window.location.href = `${API_BASE_URL}/auth/logout`}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;